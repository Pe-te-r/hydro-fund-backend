import { boolean, decimal, integer, jsonb, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums for various status and type fields
export const userStatusEnum = pgEnum('user_status', ['active', 'blocked', 'suspended']);
export const vipTierEnum = pgEnum('vip_tier', ['standard','bronze', 'silver', 'gold', 'platinum']);
export const paymentMethodEnum = pgEnum('payment_method', ['mpesa', 'paypal', 'crypto', 'bank_transfer']);
export const transactionTypeEnum = pgEnum('transaction_type', ['deposit', 'withdrawal', 'fee', 'bonus', 'investment', 'earning']);
export const transactionStatusEnum = pgEnum('transaction_status', ['pending',"expired" ,'completed', 'failed', 'reversed']);
export const investmentStatusEnum = pgEnum('investment_status', ['active', 'completed']);
export const orderStatusEnum = pgEnum('order_status', ['pending', 'processing', 'completed', 'cancelled']);
export const alertSeverityEnum = pgEnum('alert_severity', ['low', 'medium', 'high', 'critical']);
export const alertStatusEnum = pgEnum('alert_status', ['open', 'investigating', 'resolved', 'false_positive']);
export const productCategoryEnum = pgEnum('product_category', ['retail', 'wholesale', 'digital', 'service']);
export const roleEnum = pgEnum('role',['admin','user'])
export const withdrawalStatusEnum = pgEnum('withdrawal_status', [
    'pending',
    'completed',
    'rejected',
    'canceled'
]);


// Users table (expanded with enums)
export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    username: text('username').notNull().unique(),
    email: varchar('email', { length: 256 }).notNull().unique(),
    phone: varchar('phone', { length: 256 }).notNull().unique(),
    status: userStatusEnum('status').default('active'),
    balance: decimal('balance', { precision: 19, scale: 4 }).default('0'),
    deposit: decimal('deposit', { precision: 19, scale: 4 }).default('0'),
    twoFactorSecret: text('two_factor_secret').notNull(),
    role: roleEnum('role').default('user'),
    twoFactorEnabled: boolean('two_factor_secret_enable').default(false),
    vipTier: vipTierEnum('vip_tier'),
    code:varchar('code'),
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
    isSelfReferral: boolean('is_self_referral').default(false),
    createdAt: timestamp('created_at').defaultNow(),
});

// Financial tables
export const withdrawals = pgTable('withdrawals', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    amount: decimal('amount', { precision: 19, scale: 4 }).notNull(),
    netAmount: decimal('netAmount', {precision: 19, scale: 4}).notNull(),
    fee: decimal('fee', { precision: 19, scale: 4 }).notNull(),
    phone: varchar('phone').notNull(),
    admin_info:text('admin'),
    status: withdrawalStatusEnum('status').default('pending').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    processedAt: timestamp('process_at'),
});

// Schema for orders
export const orders = pgTable('orders', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id),
    totalAmount: decimal('total_amount', { precision: 19, scale: 4 }).notNull(),
    status: investmentStatusEnum('status').default('active'), // pending, completed, cancelled
    claimed: boolean('claimed').default(false),
    fee: decimal('fee', { precision: 19, scale: 4 }).notNull().default('0'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// Schema for order items
export const orderItems = pgTable('order_items', {
    id: uuid('id').defaultRandom().primaryKey(),
    orderId: uuid('order_id').references(() => orders.id),
    productId: integer('product_id').notNull(),
    productName: text('product_name').notNull(),
    quantity: integer('quantity').notNull(),
    price: decimal('price', { precision: 19, scale: 4 }).notNull(),
    dailyIncome: decimal('daily_income', { precision: 19, scale: 4 }).notNull(),
    totalIncome: decimal('total_income', { precision: 19, scale: 4 }).notNull(),
    cycle: integer('cycle').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});

export const newBonus = pgTable('bonus', {
    userId: uuid('user_id').notNull().references(() => users.id),
    status: transactionStatusEnum('status').default('pending'),
    bonusAmount: decimal('bonus_amount', { precision: 19, scale: 4 }).default('50'),
    createdAt: timestamp('created_at').defaultNow(),
})





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


// Define relationships
// users
export const usersRelations = relations(users, ({ one, many }) => ({
    password: one(passwords, {
        fields: [users.id],
        references: [passwords.userId],
    }),
    bonus: one(newBonus, {
        fields: [users.id],
        references: [newBonus.userId],
    }),
    withdrawals: many(withdrawals),
    orders:many(orders),
    referredUsers: many(referrals, { relationName: 'referrer' }),
    referredBy: many(referrals, { relationName: 'referred' }),
}));

// password
export const passwordsRelations = relations(passwords, ({ one }) => ({
    user: one(users, {
        fields: [passwords.userId],
        references: [users.id],
    }),
}));

// referrals
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

// bonus
export const bonusRelations = relations(newBonus, ({ one }) => ({
    user: one(users, {
        fields: [newBonus.userId],
        references: [users.id],
    }),
}));

// withdraw
export const withdrawalsRelations = relations(withdrawals, ({ one }) => ({
    user: one(users, {
        fields: [withdrawals.userId],
        references: [users.id],
    }), 
}));


//orders
export const ordersRelations = relations(orders, ({ many, one }) => ({
    items: many(orderItems),
    user: one(users, {
        fields: [orders.userId],
        references: [users.id],
    }),
}));

// order-item
export const orderItemsRelations = relations(orderItems, ({ one }) => ({
    order: one(orders, {
        fields: [orderItems.orderId],
        references: [orders.id],
    }),
}));