import { count, eq,sql, sum, and, not, desc, asc, gte } from "drizzle-orm";
import { db } from "../db/db.js";
import {
    referrals, users, withdrawals,
    
    userStatusEnum,
    transactionStatusEnum,
    investmentStatusEnum,
    withdrawalStatusEnum, 
    orders} from "../db/schema.js";

export const getDashBoardService = async (id: string) => {
    // Get user basic info
    const user = await db.query.users.findFirst({
        where: eq(users.id, id),
        columns: {
            username:true,
            balance: true,
            deposit:true,
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
        .where(eq(users.status, 'active'))
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

    // Get total deposited amount
    const totalDeposited = await db
        .select({ total: sum(users.deposit) })
        .from(users)
        .execute()
        .then(res => res[0].total || "0");

    // Get total withdrawn amount
    const totalWithdrawn = await db
        .select({ total: sum(withdrawals.amount) })
        .from(withdrawals)
        .where(eq(withdrawals.status, 'completed'))
        .execute()
        .then(res => res[0].total || "0");

    // Get total fees collected
    const totalFees = await db
        .select({ total: sum(withdrawals.fee) })
        .from(withdrawals)
        .where(eq(withdrawals.status, 'completed'))
        .execute()
        .then(res => res[0].total || "0");

    // Get recent completed withdrawals (last 10)
    const recentWithdrawals = await db
        .select({
            withdrawal: withdrawals,
            user: {
                email: users.email,
                phone: users.phone
            }
        })
        .from(withdrawals)
        .leftJoin(users, eq(withdrawals.userId, users.id))
        .where(eq(withdrawals.status, 'completed'))
        .orderBy(desc(withdrawals.processedAt))
        .limit(10)
        .execute()
        .then(res => res.map(item => ({
            ...item.withdrawal,
            user: item.user
        })));

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

    // Get total invested amount
    const totalInvested = await db
        .select({ total: sum(users.totalInvested) })
        .from(users)
        .execute()
        .then(res => res[0].total || "0");

    // Get investment statistics
    const investmentStats = await db
        .select({
            status: orders.status,
            count: sql<number>`count(*)`,
            totalAmount: sum(orders.totalAmount)
        })
        .from(orders)
        .groupBy(orders.status)
        .execute();

    // Get recent investments (last 10)
    const recentInvestments = await db
        .select({
            investment: orders,
            user: {
                email: users.email,
                phone: users.phone
            }
        })
        .from(orders)
        .leftJoin(users, eq(orders.userId, users.id))
        .orderBy(desc(orders.createdAt))
        .limit(10)
        .execute()
        .then(res => res.map(item => ({
            ...item.investment,
            user: item.user
        })));

    // Get referral statistics
    const referralStats = await db
        .select({
            status: referrals.bonusStatus,
            count: sql<number>`count(*)`,
            totalAmount: sum(referrals.bonusAmount)
        })
        .from(referrals)
        .groupBy(referrals.bonusStatus)
        .execute();

    // Get user growth (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const userGrowth = await db
        .select({
            date: sql<Date>`date(created_at)`,
            count: sql<number>`count(*)`
        })
        .from(users)
        .where(gte(users.createdAt, thirtyDaysAgo))
        .groupBy(sql`date(created_at)`)
        .orderBy(asc(sql`date(created_at)`))
        .execute();

    return {
        totals: {
            users: totalUsers,
            activeUsers,
            systemBalance,
            totalDeposited,
            totalWithdrawn,
            totalFees,
            totalInvested,
        },
        distributions: {
            vip: vipDistribution,
            withdrawals: withdrawalStats,
            investments: investmentStats,
            referrals: referralStats
        },
        recentActivity: {
            withdrawals: recentWithdrawals,
            investments: recentInvestments
        },
        growth: {
            users: userGrowth
        }
    };
};