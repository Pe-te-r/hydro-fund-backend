import { eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { newBonus, passwords, referrals, users, vipTierEnum } from "../db/schema.js";
import { hashPassword, verifyPassword } from "../utils/hash.js";
import { generateReferralCode } from "../utils/referral_code.js";

export const registerService = async (user: {
    username: string;
    email: string;
    phone: string;
    password: string;
    inviteCode?: string;
}) => {
    try {
        const result = await db.transaction(async (tx) => {
            // Create the user first
            const [newUser] = await tx.insert(users)
                .values({                    
                    username: user.username,
                    email: user.email,
                    phone: user.phone,
                    twoFactorSecret:null,
                    lastLogin: new Date(),
                    vipTier: 'bronze',
                })
                .returning();

            // Create password record
            await tx.insert(passwords)
                .values({
                    userId: newUser.id,
                    password: await hashPassword(user.password),
                    lastChanged: new Date()
                });
            
            // enable bonus
            await tx.insert(newBonus).values({userId:newUser.id})
            
            // Handle referral if inviteCode exists
            if (user.inviteCode) {
                // First find the referrer by their referral code
                const referrer = await tx.query.referrals.findFirst({
                    where: eq(referrals.referralCode, user.inviteCode)
                });

                if (referrer) {
                    // Create referral relationship
                    await tx.insert(referrals)
                        .values({
                            referrerId: referrer.referrerId, // The user who referred
                            referredId: newUser.id,         // The new user
                            referralCode: generateReferralCode(), // For the new user to refer others
                            bonusAmount: '50',              // Default bonus
                            bonusStatus: 'pending'          // Default status
                        });

                    // Optional: Update referrer's bonus (if immediate)
                    // await tx.update(users)...
                }
            } else {
                // Still generate a referral code for the new user
                await tx.insert(referrals)
                    .values({
                        referrerId: newUser.id, // Self-referral or no referrer
                        referredId: newUser.id,
                        referralCode: generateReferralCode(),
                        bonusAmount: '0',      // No bonus for self
                        bonusStatus: 'completed', // No pending bonus
                        isSelfReferral:true
                    });
            }

            return newUser;
        });
        return result;
    } catch (error) {
        console.error('Registration error:', error);
        return false;
    }
};



export const email_exits = async (email:string) => {
    try {
        return await db.query.users.findFirst({
            where:eq(users.email,email)
        })
    } catch (error) {
        return null
    }
}


export const phone_exits = async (phone: string) => {
    try {
        return await db.query.users.findFirst({
            where: eq(users.phone, phone)
        })
    } catch (error) {
        return null
    }
}

export const username_exits = async (username: string) => {
    try {
        return await db.query.users.findFirst({
            where: eq(users.username, username)
        })
    } catch (error) {
        return null
    }
}

export const correct_password = async (id:any,password:string) => {
    try {
        const password_value = await db.select().from(passwords).where(eq(passwords.userId,id))

        if (password_value[0]) {
            return verifyPassword(password,password_value[0]?.password)
        }
        return false
    } catch (error) {
        return false
    }

}