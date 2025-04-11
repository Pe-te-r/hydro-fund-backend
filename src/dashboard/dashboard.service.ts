import { count, eq, sum, and, not } from "drizzle-orm";
import { db } from "../db/db.js";
import { referrals, users } from "../db/schema.js";

export const getDashBoardService = async (id: string) => {
    // Get user basic info
    const user = await db.query.users.findFirst({
        where: eq(users.id, id),
        columns: {
            username:true,
            balance: true,
            totalInvested: true,
            status: true,
            totalWithdrawn: true,
            createdAt: true,
            vipTier: true,
        },
 
        
    });

    if (!user) return null;

    const ownReferral = await db.query.referrals.findFirst({
            where: 
                eq(referrals.referredId, id),
                // eq(referrals.isSelfReferral, true) // Only get their self-referral
            // ),
            columns: {
                referralCode: true // Only fetch the code
            }
        });


    // Get total referral count (excluding self-referrals)
    const referralCountResult = await db
        .select({ count: count() })
        .from(referrals)
        .where(
            and(
                eq(referrals.referrerId, id),
                not(referrals.isSelfReferral)
            )
        )
        .then(res => res[0]?.count || 0);

    return {
        ...user,
        ownReferral,
        referralNo: referralCountResult,
        referralAmount: referralCountResult * 50
    };
};