import { and, eq, lt, or } from "drizzle-orm"
import { db } from "../db/db.js"
import { newBonus, referrals, users } from "../db/schema.js"

export const getAllUserService = async() => {
    return await db.query.users.findMany()
}
export const OneUserService = async (id: string) => {
    // Get user with referral relationships
    const userWithReferrals = await db.query.users.findFirst({
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
            bonus: {
                columns: {
                    status: true,
                    bonusAmount: true
                }
            },

        }
    });

    // Get the user's OWN referral code (self-referral)
    const ownReferral = await db.query.referrals.findFirst({
        where: 
            eq(referrals.referredId, id),
            // eq(referrals.isSelfReferral, true) // Only get their self-referral
        // ),
        columns: {
            referralCode: true // Only fetch the code
        }
    });

    return {
        ...userWithReferrals,
        referralCode: ownReferral?.referralCode || null // Attach the code
    };
}


export const OneUserServiceId = async (id: string) => {
    return await db.query.users.findFirst({
        where: eq(users.id,id)
    })
}





