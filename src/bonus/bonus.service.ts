import { db } from "../db/db.js"
import { referrals, users } from "../db/schema.js"
import { eq, sql } from 'drizzle-orm';

export const claimBonusService = async (referredId: string): Promise<boolean> => {
    try {
        return await db.transaction(async (tx) => {
            // 1. Verify the referral exists and is claimable
            const referral = await tx.query.referrals.findFirst({
                where: (referrals, { eq, and }) => and(
                    eq(referrals.referredId, referredId),
                    eq(referrals.bonusStatus, 'pending')
                ),
            });

            if (!referral) {
                console.log('No claimable bonus found');
                return false;
            }

            // 2. Update the referral status and zero out the amount
            await tx.update(referrals)
                .set({
                    bonusStatus: 'completed',
                    bonusAmount: '0'
                })
                .where(eq(referrals.id, referral.id));

            // 3. Update the referrer's balance
            await tx.update(users)
                .set({
                    balance: sql`${users.balance} + ${referral.bonusAmount}`
                })
                .where(eq(users.id, referral.referrerId));

            // 4. Update the referrer's total invested (if needed)
            await tx.update(users)
                .set({
                    totalInvested: sql`${users.totalInvested} + ${referral.bonusAmount}`
                })
                .where(eq(users.id, referral.referrerId));

            return true;
        });
    } catch (error) {
        console.error('Failed to claim bonus:', error);
        return false;
    }
};