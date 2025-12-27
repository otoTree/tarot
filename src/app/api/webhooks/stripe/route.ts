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
      await db.update(users)
        .set({ plan: newPlan })
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

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  // Use type assertion to access subscription safely
  const inv = invoice as unknown as { subscription: string | null; customer: string | null };
  if (!inv.subscription) return;

  // We don't strictly need to fetch the subscription if we just want to reset usage
  // The fact that the invoice is paid and linked to a subscription is enough to signal a renewal/payment
  
  const customerId = inv.customer;
  if (!customerId) return;

  const user = await db.query.users.findFirst({
      where: eq(users.stripeCustomerId, customerId),
  });

  if (!user) return;

  // Identify Plan from Invoice to determine credits
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const priceId = (invoice.lines.data[0] as any)?.price?.id;
  let planConfig = PRICING_PLANS[PLANS.BASIC];

  for (const config of Object.values(PRICING_PLANS)) {
      if (config.stripePriceId === priceId) {
          planConfig = config;
          break;
      }
  }

  // Calculate credits to add
  // Only add credits for monthly plans (Pro/Premium), not Basic (total)
  let creditsToAdd = 0;
  if (planConfig.features.aiReadings.type === 'month') {
      creditsToAdd = planConfig.features.aiReadings.limit;
  }

  // Update user: reset usage AND add credits
  await db.update(users)
      .set({ 
          aiReadingsUsage: 0,
          consultationUsage: 0,
          creditBalance: user.creditBalance + creditsToAdd
      })
      .where(eq(users.id, user.id));
      
  console.log(`Processed invoice for user ${user.id}: Added ${creditsToAdd} credits.`);
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
