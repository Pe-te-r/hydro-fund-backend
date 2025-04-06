import { boolean, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    username: text('username').notNull(),
    email: varchar('email', { length: 256 }).notNull(),
    inviteCode: text('invite_code'),
    phone: varchar('phone', { length: 256 }).notNull(),
    blocked:boolean('blocked').default(false)
});

export const passwords = pgTable('passwords', {
    userId: uuid('id').primaryKey().references(() => users.id),
    password: text('password').notNull()
});

export const referrals = pgTable('referrals', {
    userId: uuid('id').primaryKey().references(() => users.id),
    referralCode: text('referral_code').notNull()
});

export const usersRelations = relations(users, ({ one }) => ({
    password: one(passwords, {
        fields: [users.id],
        references: [passwords.userId],
    }),
    referral: one(referrals, {
        fields: [users.id],
        references: [referrals.userId],
    }),
}));



export type SelectUser = typeof users.$inferSelect;
