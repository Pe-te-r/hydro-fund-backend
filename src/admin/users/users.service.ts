import { eq } from "drizzle-orm"
import { db } from "../../db/db.js"
import {
    referrals,
    users
 } from "../../db/schema.js"

export const getAllUsers = async () => {
    return await db.query.users.findMany({
        columns: {
            balance: true,
            email: true,
            status: true,
            phone: true,
            vipTier: true,
            lastLogin: true,
            id:true
            
        }
    })
}

export const updateUserStatus = async (id: string, status: 'active' | 'blocked' | 'suspended'='blocked') => {
    await db.update(users).set({ status: status }).where(eq(users.id, id))
    return true
    
}


export async function adminUserService(userId: string) {
    try {
        // Fetch the base user information
        const userData = await db.query.users.findFirst({
            where: eq(users.id, userId),
            with: {
                // Include password info
                password: true,
                // Include bonus info
                bonus: {
                    columns: {
                        userId: false,
                        createdAt:false,
                    }
                },
                // Include all withdrawals
                withdrawals: {
                    columns: {
                        amount: true,
                        netAmount: true,
                        fee: true,
                        admin_info: true,
                        status: true,
                        createdAt: true,
                        processedAt:true
                        
                    }
                },
                // Include referral relationships
                referredUsers: {
                                where: eq(referrals.isSelfReferral, false),
                                columns: {
                                    bonusAmount: true,
                                    bonusStatus: true,
                                },
                                with: {
                                    referred: {
                                        columns: {
                                            email: true,
                                            id:true,
                                        }
                                    },
                                }
                            },
                referredBy: {
                    where: eq(referrals.isSelfReferral, false),
                    columns: {},
                    with: {
                                    referrer: {
                                        columns: {
                                            email: true
                                        }
                                    },
                                }
                            },
                // Include orders and their items
                orders: {
                    columns: {
                        userId: false,
                    updatedAt:false
                        
                    },
                    with: {
                        items: true
                    }
                },
            }
        });

        if (!userData) {
            throw new Error('User not found');
        }

        // Structure the response with all relevant data
        const adminViewData = {
            userInfo: {
                id: userData.id,
                username: userData.username,
                email: userData.email,
                phone: userData.phone,
                status: userData.status,
                balance: userData.balance,
                deposit: userData.deposit,
                role: userData.role,
                vipTier: userData.vipTier,
                code: userData.code,
                totalInvested: userData.totalInvested,
                totalWithdrawn: userData.totalWithdrawn,
                createdAt: userData.createdAt,
                lastLogin: userData.lastLogin,
                profileComplete: userData.profileComplete,
                twoFactorEnabled: userData.twoFactorEnabled
            },
            security: {
                passwordLastChanged: userData.password?.lastChanged,
                twoFactorSecret: userData.twoFactorSecret
            },
            financial: {
                bonus: userData?.bonus,
                withdrawals: userData?.withdrawals,
                totalWithdrawnAmount: userData.withdrawals.reduce(
                    (sum, withdrawal) => sum + parseFloat(withdrawal.amount.toString()),
                    0
                ),
                pendingWithdrawals: userData.withdrawals.filter(
                    w => w.status === 'pending'
                ),
                completedWithdrawals: userData.withdrawals.filter(
                    w => w.status === 'completed'
                )
            },
            investments: {
                orders: userData.orders.map(order => ({
                    ...order,
                    totalAmount: order.totalAmount,
                    status: order.status,
                    items: order.items
                })),
                totalInvested: userData.orders.reduce(
                    (sum, order) => sum + parseFloat(order.totalAmount.toString()),
                    0
                ),
                activeInvestments: userData.orders.filter(
                    o => o.status === 'active'
                ),
                completedInvestments: userData.orders.filter(
                    o => o.status === 'completed'
                )
            },
            referrals: {
                referredBy: userData.referredBy,
                referredUsers: userData.referredUsers,
                totalReferrals: userData.referredUsers.length,
                potentialBonus: userData.referredUsers.reduce(
                    (sum, ref) => sum + parseFloat(ref?.bonusAmount || ''),
                    0
                )
            }
        };

        return adminViewData;
    } catch (error) {
        console.error('Error in adminUserService:', error);
        throw error;
    }
}