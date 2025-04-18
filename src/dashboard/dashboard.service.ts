import { count, eq,sql, sum, and, not } from "drizzle-orm";
import { db } from "../db/db.js";
import {
    referrals, users, withdrawals,
    
    investments,
    userStatusEnum,
    transactionStatusEnum,
    investmentStatusEnum,
    withdrawalStatusEnum } from "../db/schema.js";

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
                not(referrals.isSelfReferral),
                eq(referrals.bonusStatus, 'completed')
            )
        )
        .then(res => res[0]?.count || 0);
        console.log(referralCountResult)

    return {
        ...user,
        ownReferral,
        referralNo: referralCountResult,
        referralAmount: referralCountResult * 50
    };
};




export const adminDashboardService = async () => {
    // Get total number of users
    const totalUsers = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .execute()
        .then(res => res[0].count);

    // Get active users count
    const activeUsers = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(eq(users.status, userStatusEnum.enumValues[0])) // 'active'
        .execute()
        .then(res => res[0].count);

    // Get VIP tier distribution
    const vipDistribution = await db
        .select({
            tier: users.vipTier,
            count: sql<number>`count(*)`
        })
        .from(users)
        .groupBy(users.vipTier)
        .execute();

    // Get total system balance (sum of all users' balances)
    const systemBalance = await db
        .select({ total: sum(users.balance) })
        .from(users)
        .execute()
        .then(res => res[0].total || "0");

    // Get total deposited amount (sum of all users' deposits)
    const totalDeposited = await db
        .select({ total: sum(users.deposit) })
        .from(users)
        .execute()
        .then(res => res[0].total || "0");

    // Get total withdrawn amount (sum of all completed withdrawals)
    const totalWithdrawn = await db
        .select({ total: sum(withdrawals.amount) })
        .from(withdrawals)
        .where(eq(withdrawals.status, withdrawalStatusEnum.enumValues[1])) // 'completed'
        .execute()
        .then(res => res[0].total || "0");

    // Get total fees collected (sum of all withdrawal fees)
    const totalFees = await db
        .select({ total: sum(withdrawals.fee) })
        .from(withdrawals)
        .where(eq(withdrawals.status, withdrawalStatusEnum.enumValues[1])) // 'completed'
        .execute()
        .then(res => res[0].total || "0");

    // Get recent completed withdrawals (last 10)
    const recentWithdrawals = await db
        .select()
        .from(withdrawals)
        .where(eq(withdrawals.status, withdrawalStatusEnum.enumValues[1])) // 'completed'
        .orderBy(withdrawals.processedAt)
        .limit(10)
        .execute();

    // Get withdrawal statistics by status
    const withdrawalStats = await db
        .select({
            status: withdrawals.status,
            count: sql<number>`count(*)`,
            totalAmount: sum(withdrawals.amount)
        })
        .from(withdrawals)
        .groupBy(withdrawals.status)
        .execute();

    // Get transaction volume (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get active investments count
    const activeInvestments = await db
        .select({ count: sql<number>`count(*)` })
        .from(investments)
        .where(eq(investments.status, investmentStatusEnum.enumValues[0])) // 'active'
        .execute()
        .then(res => res[0].count);

    // Get completed investments count
    const completedInvestments = await db
        .select({ count: sql<number>`count(*)` })
        .from(investments)
        .where(eq(investments.status, investmentStatusEnum.enumValues[1])) // 'completed'
        .execute()
        .then(res => res[0].count);

    // Get total invested amount
    const totalInvested = await db
        .select({ total: sum(users.totalInvested) })
        .from(users)
        .execute()
        .then(res => res[0].total || "0");

    return {
        totals: {
            users: totalUsers,
            activeUsers,
            systemBalance,
            totalDeposited,
            totalWithdrawn,
            totalFees,
            totalInvested,
            activeInvestments,
            completedInvestments
        },
        distributions: {
            vip: vipDistribution,
            withdrawals: withdrawalStats
        },
        recentActivity: {
            withdrawals: recentWithdrawals
        },

    };
};