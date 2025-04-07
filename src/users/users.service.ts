import { and, eq, lt, or } from "drizzle-orm"
import { db } from "../db/db.js"
import { newBonus, referrals, users } from "../db/schema.js"

export const getAllUserService = async() => {
    return await db.query.users.findMany()
}
// export const OneUserService = async (id: string) => {
//     // Get user with referral relationships
//     const userWithReferrals = await db.query.users.findFirst({
//         where: eq(users.id, id),
//         with: {
//             referredUsers: {
//                 where: eq(referrals.isSelfReferral, false),
//                 columns: {
//                     bonusAmount: true,
//                     bonusStatus: true,
//                 },
//                 with: {
//                     referred: {
//                         columns: {
//                             email: true,
//                         }
//                     },
//                 }
//             },
//             referredBy: {
//                 where: eq(referrals.isSelfReferral, false),
//                 columns: {},
//                 with: {
//                     referrer: {
//                         columns: {
//                             email: true
//                         }
//                     },
//                 }
//             }
//         }
//     });

//     // Get the user's OWN referral code (self-referral)
//     const ownReferral = await db.query.referrals.findFirst({
//         where: 
//             eq(referrals.referredId, id),
//             // eq(referrals.isSelfReferral, true) // Only get their self-referral
//         // ),
//         columns: {
//             referralCode: true // Only fetch the code
//         }
//     });

//     return {
//         ...userWithReferrals,
//         referralCode: ownReferral?.referralCode || null // Attach the code
//     };
// }








export const OneUserService = async (id: string) => {
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

    return await db.transaction(async (tx) => {
        // 1. First expire old bonuses (both newBonus and referrals)
        await Promise.all([
            // Expire newBonus records older than 3 days
            tx.update(newBonus)
                .set({
                    status: 'expired',
                    bonusAmount: '0'
                })
                .where(
                    and(
                        eq(newBonus.userId, id),
                        eq(newBonus.status, 'pending'),
                        lt(newBonus.createdAt, threeDaysAgo)
                    )
                ),

            // Expire referral bonuses older than 2 days
            tx.update(referrals)
                .set({
                    bonusStatus: 'expired',
                    bonusAmount: '0'
                })
                .where(
                    and(
                        or(
                            eq(referrals.referrerId, id),
                            eq(referrals.referredId, id)
                        ),
                        eq(referrals.bonusStatus, 'pending'),
                        lt(referrals.createdAt, twoDaysAgo)
                    )
                )
        ]);

        // 2. Get user data with fresh statuses
        const [userWithReferrals, ownReferral] = await Promise.all([
            tx.query.users.findFirst({
                where: eq(users.id, id),
                with: {
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
                    bonus: {
                        columns: {
                            status: true,
                            bonusAmount:true
                        }
                    }
                }
            }),
            tx.query.referrals.findFirst({
                where: eq(referrals.referredId, id),
                columns: {
                    referralCode: true
                }
            })
        ]);

        return {
            ...userWithReferrals,
            referralCode: ownReferral?.referralCode || null
        };
    });
};