import { db } from "../db/db.js";
import { newBonus, referrals, users } from "../db/schema.js";
import { and, eq, lt, sql } from 'drizzle-orm';

// Helper to calculate expiration dates
const getExpirationDates = () => {
    const now = new Date();
    return {
        threeDaysAgo: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        twoDaysAgo: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
    };
};

export const claimBonusService = async (referredId: string): Promise<boolean> => {
    try {
        return await db.transaction(async (tx) => {
            const { twoDaysAgo } = getExpirationDates();

            // 1. First expire any pending referrals older than 2 days
            await tx.update(referrals)
                .set({
                    bonusStatus: 'expired',
                    bonusAmount: '0'
                })
                .where(
                    and(
                        eq(referrals.referredId, referredId),
                        eq(referrals.bonusStatus, 'pending'),
                        lt(referrals.createdAt, twoDaysAgo)
                    )
                );

            // 2. Verify the referral exists and is still claimable
            const referral = await tx.query.referrals.findFirst({
                where: and(
                    eq(referrals.referredId, referredId),
                    eq(referrals.bonusStatus, 'pending')
                ),
            });

            if (!referral) return false;

            // 3. Process the claim
            await tx.update(referrals)
                .set({
                    bonusStatus: 'completed',
                    bonusAmount: '0'
                })
                .where(eq(referrals.id, referral.id));

            await tx.update(users)
                .set({
                    balance: sql`${users.balance} + ${referral.bonusAmount}`
                })
                .where(eq(users.id, referral.referrerId));

            return true;
        });
    } catch (error) {
        console.error('Failed to claim bonus:', error);
        return false;
    }
};

export const accountBonusService = async (userId: string): Promise<boolean> => {
    try {
        return await db.transaction(async (tx) => {
            const { threeDaysAgo } = getExpirationDates();

            // 1. First expire any pending bonuses older than 3 days
            await tx.update(newBonus)
                .set({
                    status: 'expired',
                    bonusAmount: '0'
                })
                .where(
                    and(
                        eq(newBonus.userId, userId),
                        eq(newBonus.status, 'pending'),
                        lt(newBonus.createdAt, threeDaysAgo)
                    )
                );

            // 2. Check for claimable bonus
            const bonus = await tx.query.newBonus.findFirst({
                where: and(
                    eq(newBonus.userId, userId),
                    eq(newBonus.status, 'pending')
                ),
            });

            if (!bonus) return false;

            // 3. Process the claim
            await tx.update(newBonus)
                .set({
                    status: 'completed',
                    bonusAmount: '0'
                })
                .where(eq(newBonus.userId, userId));

            await tx.update(users)
                .set({
                    balance: sql`${users.balance} + ${bonus.bonusAmount}`
                })
                .where(eq(users.id, userId));

            return true;
        });
    } catch (error) {
        console.error('Failed to process account bonus:', error);
        return false;
    }
};