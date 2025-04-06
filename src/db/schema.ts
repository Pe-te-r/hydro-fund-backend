import { boolean, decimal, integer, jsonb, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums for various status and type fields
export const userStatusEnum = pgEnum('user_status', ['active', 'blocked', 'suspended']);
export const vipTierEnum = pgEnum('vip_tier', ['bronze', 'silver', 'gold', 'platinum']);
export const paymentMethodEnum = pgEnum('payment_method', ['mpesa', 'paypal', 'crypto', 'bank_transfer']);
export const transactionTypeEnum = pgEnum('transaction_type', ['deposit', 'withdrawal', 'fee', 'bonus', 'investment', 'earning']);
export const transactionStatusEnum = pgEnum('transaction_status', ['pending', 'completed', 'failed', 'reversed']);
export const investmentStatusEnum = pgEnum('investment_status', ['active', 'completed', 'cancelled', 'pending']);
export const orderStatusEnum = pgEnum('order_status', ['pending', 'processing', 'completed', 'cancelled']);
export const alertSeverityEnum = pgEnum('alert_severity', ['low', 'medium', 'high', 'critical']);
export const alertStatusEnum = pgEnum('alert_status', ['open', 'investigating', 'resolved', 'false_positive']);
export const productCategoryEnum = pgEnum('product_category', ['retail', 'wholesale', 'digital', 'service']);

// Users table (expanded with enums)
export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    username: text('username').notNull().unique(),
    email: varchar('email', { length: 256 }).notNull().unique(),
    phone: varchar('phone', { length: 256 }).notNull().unique(),
    status: userStatusEnum('status').default('active'),
    balance: decimal('balance', { precision: 19, scale: 4 }).default('0'),
    twoFactorSecret: text('two_factor_secret'),
    vipTier: vipTierEnum('vip_tier'),
    totalInvested: decimal('total_invested', { precision: 19, scale: 4 }).default('0'),
    totalWithdrawn: decimal('total_withdrawn', { precision: 19, scale: 4 }).default('0'),
    createdAt: timestamp('created_at').defaultNow(),
    lastLogin: timestamp('last_login'),
    profileComplete: boolean('profile_complete').default(false),
});

export const passwords = pgTable('passwords', {
    userId: uuid('id').primaryKey().references(() => users.id),
    password: text('password').notNull(),
    resetTokenExpires: integer('reset_token_expires'),
    lastChanged: timestamp('last_changed').defaultNow(),
});

export const referrals = pgTable('referrals', {
    id: uuid('id').defaultRandom().primaryKey(),
    referrerId: uuid('referrer_id').notNull().references(() => users.id),
    referredId: uuid('referred_id').notNull().references(() => users.id),
    referralCode: text('referral_code').notNull(),
    bonusAmount: decimal('bonus_amount', { precision: 19, scale: 4 }).default('50'),
    bonusStatus: transactionStatusEnum('bonus_status').default('pending'),
});

// Financial tables
export const transactions = pgTable('transactions', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id),
    amount: decimal('amount', { precision: 19, scale: 4 }).notNull(),
    fee: decimal('fee', { precision: 19, scale: 4 }).default('0'),
    netAmount: decimal('net_amount', { precision: 19, scale: 4 }).notNull(),
    type: transactionTypeEnum('type').notNull(),
    paymentMethod: paymentMethodEnum('payment_method'),
    reference: text('reference').notNull(),
    status: transactionStatusEnum('status').default('pending'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow(),
    processedAt: timestamp('processed_at'),
    completedAt: timestamp('completed_at'),
});

export const investmentPlans = pgTable('investment_plans', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    durationHours: integer('duration_hours').notNull(),
    baseReturnPercentage: decimal('return_percentage', { precision: 5, scale: 2 }).notNull(),
    minAmount: decimal('min_amount', { precision: 19, scale: 4 }).notNull(),
    maxAmount: decimal('max_amount', { precision: 19, scale: 4 }),
    description: text('description'),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const investments = pgTable('investments', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id),
    planId: uuid('plan_id').references(() => investmentPlans.id),
    amount: decimal('amount', { precision: 19, scale: 4 }).notNull(),
    expectedReturn: decimal('expected_return', { precision: 19, scale: 4 }).notNull(),
    actualReturn: decimal('actual_return', { precision: 19, scale: 4 }),
    startDate: timestamp('start_date').defaultNow(),
    endDate: timestamp('end_date'),
    status: investmentStatusEnum('status').default('active'),
    isReinvested: boolean('is_reinvested').default(false),
    productId: uuid('product_id'),
    transactionId: uuid('transaction_id').references(() => transactions.id),
});

// E-commerce tables
export const products = pgTable('products', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    description: text('description'),
    retailPrice: decimal('retail_price', { precision: 19, scale: 4 }).notNull(),
    wholesalePrice: decimal('wholesale_price', { precision: 19, scale: 4 }).notNull(),
    wholesaleMinQty: integer('wholesale_min_qty').notNull(),
    earningsPercentage: decimal('earnings_percentage', { precision: 5, scale: 2 }).notNull(),
    category: productCategoryEnum('category'),
    stockQty: integer('stock_qty').notNull(),
    isActive: boolean('is_active').default(true),
    imageUrl: text('image_url'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const orders = pgTable('orders', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id),
    totalAmount: decimal('total_amount', { precision: 19, scale: 4 }).notNull(),
    status: orderStatusEnum('status').default('pending'),
    paymentMethod: paymentMethodEnum('payment_method'),
    transactionId: uuid('transaction_id').references(() => transactions.id),
    shippingDetails: jsonb('shipping_details'),
    createdAt: timestamp('created_at').defaultNow(),
    completedAt: timestamp('completed_at'),
});

export const orderItems = pgTable('order_items', {
    id: uuid('id').defaultRandom().primaryKey(),
    orderId: uuid('order_id').notNull().references(() => orders.id),
    productId: uuid('product_id').notNull().references(() => products.id),
    quantity: integer('quantity').notNull(),
    unitPrice: decimal('unit_price', { precision: 19, scale: 4 }).notNull(),
    discount: decimal('discount', { precision: 19, scale: 4 }).default('0'),
    lineTotal: decimal('line_total', { precision: 19, scale: 4 }).notNull(),
    isInvestment: boolean('is_investment').default(false),
});

export const shoppingCart = pgTable('shopping_cart', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id),
    productId: uuid('product_id').notNull().references(() => products.id),
    quantity: integer('quantity').notNull().default(1),
    addedAt: timestamp('added_at').defaultNow(),
    isInvestment: boolean('is_investment').default(false),
});

// System tables
export const leaderboard = pgTable('leaderboard', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id),
    rank: integer('rank').notNull(),
    totalInvested: decimal('total_invested', { precision: 19, scale: 4 }).notNull(),
    totalReferrals: integer('total_referrals').notNull(),
    lastUpdated: timestamp('last_updated').defaultNow(),
});

export const fraudAlerts = pgTable('fraud_alerts', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id),
    alertType: varchar('alert_type', { length: 50 }).notNull(),
    severity: alertSeverityEnum('severity').notNull(),
    description: text('description').notNull(),
    status: alertStatusEnum('status').default('open'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow(),
    resolvedAt: timestamp('resolved_at'),
    resolvedBy: uuid('resolved_by').references(() => users.id),
});

export const systemSettings = pgTable('system_settings', {
    id: uuid('id').defaultRandom().primaryKey(),
    key: varchar('key', { length: 100 }).notNull().unique(),
    value: jsonb('value').notNull(),
    description: text('description'),
    updatedAt: timestamp('updated_at').defaultNow(),
    updatedBy: uuid('updated_by').references(() => users.id),
});

export const notifications = pgTable('notifications', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id),
    title: varchar('title', { length: 100 }).notNull(),
    message: text('message').notNull(),
    isRead: boolean('is_read').default(false),
    type: varchar('type', { length: 50 }).notNull(),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow(),
});

// Relations (expanded from previous version)
export const usersRelations = relations(users, ({ one, many }) => ({
    password: one(passwords, {
        fields: [users.id],
        references: [passwords.userId],
    }),
    sentReferrals: many(referrals, { relationName: 'sentReferrals' }),
    receivedReferral: one(referrals, {
        fields: [users.id],
        references: [referrals.referredId],
        relationName: 'receivedReferral'
    }),
    transactions: many(transactions),
    investments: many(investments),
    orders: many(orders),
    shoppingCart: many(shoppingCart),
    leaderboard: one(leaderboard, {
        fields: [users.id],
        references: [leaderboard.userId],
    }),
    fraudAlerts: many(fraudAlerts),
    resolvedAlerts: many(fraudAlerts, { relationName: 'resolvedAlerts' }),
    notifications: many(notifications),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
    referrer: one(users, {
        fields: [referrals.referrerId],
        references: [users.id],
        relationName: 'referrer',
    }),
    referred: one(users, {
        fields: [referrals.referredId],
        references: [users.id],
        relationName: 'referred',
    }),
}));

