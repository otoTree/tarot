import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/db';
import { users, subscriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';
import { PRICING_PLANS, PLANS, PlanLevel } from '@/lib/pricing';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log(`[Stripe Webhook] Received event: ${event.type}, id: ${event.id}`);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Webhook signature verification failed: ${errorMessage}`);
    return new NextResponse(`Webhook Error: ${errorMessage}`, { status: 400 });
  }

  try {
    switch (event.type) {
      // Subscription Created/Updated/Deleted
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
      case 'customer.subscription.paused':
      case 'customer.subscription.resumed':
      case 'customer.subscription.pending_update_applied':
      case 'customer.subscription.pending_update_expired':
        await handleSubscriptionChange(event);
        break;

      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      // Invoice Events
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      case 'invoice.payment_action_required':
      case 'invoice.upcoming':
        // Log or notify user if needed
        console.log(`Invoice event ${event.type} for ${(event.data.object as Stripe.Invoice).id}`);
        break;

      // Charge Events
      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;
      case 'charge.dispute.created':
      case 'charge.dispute.closed':
        // Log dispute
        console.log(`Dispute event ${event.type} for ${(event.data.object as Stripe.Dispute).id}`);
        break;

      // Customer Events
      case 'customer.created':
      case 'customer.updated':
      case 'customer.deleted':
        await handleCustomerChange(event.data.object as Stripe.Customer, event.type);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (error) {
    console.error(`Error handling event ${event.type}:`, error);
    return new NextResponse('Webhook handler failed', { status: 500 });
  }

  return new NextResponse(null, { status: 200 });
}

async function handleSubscriptionChange(event: Stripe.Event) {
  console.log(`[Stripe Webhook] Handling subscription change: ${event.type}`);
  const subscription = event.data.object as Stripe.Subscription;
  const customerId = subscription.customer as string;

  // Find user by stripeCustomerId
  const user = await db.query.users.findFirst({
    where: eq(users.stripeCustomerId, customerId),
  });

  if (!user) {
    console.error(`User not found for customer ${customerId}`);
    return;
  }

  // Check if subscription exists in DB
  const existingSub = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.stripeSubscriptionId, subscription.id),
  });

  // Safe access to current_period_start/end
  // Ensure we have valid numbers before creating Dates
  // Using unknown cast first to avoid eslint no-explicit-any error
  const subTyped = subscription as unknown as { current_period_start?: number; current_period_end?: number };
  const startTime = subTyped.current_period_start;
  const endTime = subTyped.current_period_end;

  // Fallback to current time if start is missing
  const currentPeriodStart = startTime 
    ? new Date(startTime * 1000) 
    : new Date();
    
  // Fallback to 30 days from now if end is missing
  const currentPeriodEnd = endTime 
    ? new Date(endTime * 1000) 
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const subscriptionData = {
    userId: user.id,
    stripeSubscriptionId: subscription.id,
    stripePriceId: subscription.items.data[0]?.price.id,
    status: subscription.status,
    currentPeriodStart,
    currentPeriodEnd,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  };

  if (existingSub) {
    await db.update(subscriptions)
      .set(subscriptionData)
      .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
  } else {
    await db.insert(subscriptions).values(subscriptionData);
  }

  // Update user plan based on price ID
  if (subscription.status === 'active' || subscription.status === 'trialing') {
    const priceId = subscription.items.data[0].price.id;
    let newPlan: PlanLevel = PLANS.BASIC;

    for (const [key, config] of Object.entries(PRICING_PLANS)) {
      if (config.stripePriceId === priceId) {
        newPlan = key as PlanLevel;
        break;
      }
    }

    if (newPlan !== user.plan) {
      console.log(`[Stripe Webhook] Plan mismatch detected for user ${user.id}: current=${user.plan}, new=${newPlan}`);
      
      const planConfig = PRICING_PLANS[newPlan];
      let creditsToAdd = 0;
      
      if (planConfig && planConfig.features.aiReadings.type === 'month') {
          creditsToAdd = planConfig.features.aiReadings.limit;
      }

      console.log(`[Stripe Webhook] Upgrading user ${user.id} to ${newPlan}, adding ${creditsToAdd} credits.`);

      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      await db.update(users)
        .set({ 
          plan: newPlan,
          creditBalance: user.creditBalance + creditsToAdd,
          creditsExpiresAt: expiresAt,
          aiReadingsUsage: 0,
          consultationUsage: 0,
        })
        .where(eq(users.id, user.id));
    }
  } else if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
      // Revert to basic if subscription is not valid
      if (user.plan !== PLANS.BASIC) {
          await db.update(users)
            .set({ plan: PLANS.BASIC })
            .where(eq(users.id, user.id));
      }
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log(`[Stripe Webhook] Handling checkout.session.completed for session: ${session.id}`);

  if (!session.metadata?.userId || !session.metadata?.plan) {
    console.log('[Stripe Webhook] Missing metadata in checkout session', session.metadata);
    return;
  }

  const userId = parseInt(session.metadata.userId);
  const plan = session.metadata.plan as PlanLevel;
  
  console.log(`[Stripe Webhook] Metadata - userId: ${userId}, plan: ${plan}`);

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    console.log(`[Stripe Webhook] User not found: ${userId}`);
    return;
  }

  const planConfig = PRICING_PLANS[plan];
  if (!planConfig) {
     console.log(`[Stripe Webhook] Invalid plan in metadata: ${plan}`);
     return;
  }

  console.log(`[Stripe Webhook] Plan config found for ${plan}`);

  // Calculate credits to add
  let creditsToAdd = 0;
  if (planConfig.features.aiReadings.type === 'month') {
      creditsToAdd = planConfig.features.aiReadings.limit;
  }

  console.log(`[Stripe Webhook] Credits to add: ${creditsToAdd}`);

  // Calculate expiration date (1 month from now)
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await db.update(users)
    .set({
      plan: plan,
      stripeCustomerId: session.customer as string,
      creditBalance: user.creditBalance + creditsToAdd,
      creditsExpiresAt: expiresAt,
      aiReadingsUsage: 0,
      consultationUsage: 0,
    })
    .where(eq(users.id, userId));
    
  console.log(`[Stripe Webhook] Processed checkout session for user ${userId}: Added ${creditsToAdd} credits, new balance: ${user.creditBalance + creditsToAdd}, expires at ${expiresAt.toISOString()}.`);
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log(`[Stripe Webhook] Handling invoice.paid for invoice: ${invoice.id}`);

  // Use type assertion to access subscription safely
  const inv = invoice as unknown as { subscription: string | null; customer: string | null };
  if (!inv.subscription) {
    console.log(`[Stripe Webhook] Invoice has no subscription, skipping.`);
    return;
  }

  // Skip if this is a subscription creation or update (handled by checkout.session.completed)
  // We only want to handle recurring payments (renewals) here
  if (invoice.billing_reason === 'subscription_create' || invoice.billing_reason === 'subscription_update') {
    console.log(`[Stripe Webhook] Skipping invoice.paid for ${invoice.billing_reason} (handled by checkout): ${invoice.id}`);
    return;
  }
  
  const customerId = inv.customer;
  if (!customerId) {
    console.log(`[Stripe Webhook] Invoice has no customer, skipping.`);
    return;
  }

  const user = await db.query.users.findFirst({
      where: eq(users.stripeCustomerId, customerId),
  });

  if (!user) {
    console.log(`[Stripe Webhook] User not found for customerId: ${customerId}`);
    return;
  }

  console.log(`[Stripe Webhook] Found user: ${user.id} for customer: ${customerId}`);

  // Identify Plan from Invoice to determine credits
  const lineItem = invoice.lines.data[0] as unknown as { price?: { id: string } };
  const priceId = lineItem?.price?.id;
  console.log(`[Stripe Webhook] Price ID from invoice: ${priceId}`);

  let planConfig = PRICING_PLANS[PLANS.BASIC];

  for (const config of Object.values(PRICING_PLANS)) {
      if (config.stripePriceId === priceId) {
          planConfig = config;
          break;
      }
  }

  // If we couldn't match the price ID, log a warning
  if (planConfig === PRICING_PLANS[PLANS.BASIC] && priceId) {
      console.warn(`[Stripe Webhook] Could not match Stripe Price ID ${priceId} to any plan. Defaulting to BASIC (no credits).`);
  } else {
      console.log(`[Stripe Webhook] Matched plan config.`);
  }

  // Calculate credits to add
  // Only add credits for monthly plans (Pro/Premium), not Basic (total)
  let creditsToAdd = 0;
  if (planConfig.features.aiReadings.type === 'month') {
      creditsToAdd = planConfig.features.aiReadings.limit;
  }

  console.log(`[Stripe Webhook] Credits to add (renewal): ${creditsToAdd}`);

  // Calculate expiration date (1 month from now)
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  // Update user: reset usage AND add credits
  await db.update(users)
      .set({ 
          aiReadingsUsage: 0,
          consultationUsage: 0,
          creditBalance: user.creditBalance + creditsToAdd,
          creditsExpiresAt: expiresAt
      })
      .where(eq(users.id, user.id));
      
  console.log(`[Stripe Webhook] Processed invoice (renewal) for user ${user.id}: Added ${creditsToAdd} credits, new balance: ${user.creditBalance + creditsToAdd}, expires at ${expiresAt.toISOString()}.`);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log(`Payment failed for invoice ${invoice.id}`);
  // Optionally update user status or send email
}

async function handleChargeRefunded(charge: Stripe.Charge) {
    console.log(`Charge refunded ${charge.id}`);
    // If a charge is refunded, we might want to downgrade the user or remove credits
    // For now, just logging. Logic depends on business rules.
}

async function handleCustomerChange(customer: Stripe.Customer, eventType: string) {
    if (eventType === 'customer.deleted') {
        await db.update(users)
            .set({ stripeCustomerId: null, plan: PLANS.BASIC })
            .where(eq(users.stripeCustomerId, customer.id));
    }
}
