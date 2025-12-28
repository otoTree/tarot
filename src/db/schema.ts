import { pgTable, serial, text, integer, boolean, timestamp, uuid, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const spreads = pgTable('spreads', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull(), // e.g., "celtic-cross"
  lang: text('lang').notNull().default('en'), // 'en' | 'zh'
  name: text('name').notNull(),
  description: text('description').notNull(),
  detail: text('detail'),
  difficulty: text('difficulty'),
  recommended: boolean('recommended').default(false),
  tags: text('tags').array(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  slugLangUnique: unique('slug_lang_unique').on(t.slug, t.lang),
}));

export const spreadPositions = pgTable('spread_positions', {
  id: serial('id').primaryKey(),
  spreadId: integer('spread_id').references(() => spreads.id, { onDelete: 'cascade' }).notNull(),
  positionIndex: text('position_index').notNull(), // "1", "2"... mapping to SpreadPosition.id
  name: text('name').notNull(),
  description: text('description').notNull(),
  x: integer('x').notNull(),
  y: integer('y').notNull(),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  creditBalance: integer('credit_balance').default(10).notNull(),
  creditsExpiresAt: timestamp('credits_expires_at'),
  
  // Stripe & Pricing fields
  stripeCustomerId: text('stripe_customer_id').unique(),
  plan: text('plan').default('basic').notNull(), // 'basic', 'pro', 'premium'
  aiReadingsUsage: integer('ai_readings_usage').default(0).notNull(),
  consultationUsage: integer('consultation_usage').default(0).notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  stripeSubscriptionId: text('stripe_subscription_id').unique().notNull(),
  stripePriceId: text('stripe_price_id').notNull(),
  status: text('status').notNull(),
  currentPeriodStart: timestamp('current_period_start').notNull(),
  currentPeriodEnd: timestamp('current_period_end').notNull(),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  spreadId: text('spread_id').notNull(),
  question: text('question').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const redemptionCodes = pgTable('redemption_codes', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  points: integer('points').notNull(),
  isUsed: boolean('is_used').default(false).notNull(),
  usedBy: integer('used_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  usedAt: timestamp('used_at'),
});

export const cardsDrawn = pgTable('cards_drawn', {
  id: serial('id').primaryKey(),
  sessionId: uuid('session_id').notNull().references(() => sessions.id),
  cardId: text('card_id').notNull(),
  positionId: text('position_id').notNull(),
  isReversed: boolean('is_reversed').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const emailVerifications = pgTable('email_verifications', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  code: text('code').notNull(),
  sentAt: timestamp('sent_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
});

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  sessionId: uuid('session_id').notNull().references(() => sessions.id),
  role: text('role').notNull(), // 'user' or 'assistant' usually
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  redemptionCodes: many(redemptionCodes),
  subscriptions: many(subscriptions),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
  messages: many(messages),
  cardsDrawn: many(cardsDrawn),
}));

export const redemptionCodesRelations = relations(redemptionCodes, ({ one }) => ({
  user: one(users, {
    fields: [redemptionCodes.usedBy],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  session: one(sessions, {
    fields: [messages.sessionId],
    references: [sessions.id],
  }),
}));

export const cardsDrawnRelations = relations(cardsDrawn, ({ one }) => ({
  session: one(sessions, {
    fields: [cardsDrawn.sessionId],
    references: [sessions.id],
  }),
}));

export const spreadsRelations = relations(spreads, ({ many }) => ({
  positions: many(spreadPositions),
}));

export const spreadPositionsRelations = relations(spreadPositions, ({ one }) => ({
  spread: one(spreads, {
    fields: [spreadPositions.spreadId],
    references: [spreads.id],
  }),
}));
