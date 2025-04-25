import { eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { newBonus, passwords, referrals, users, vipTierEnum } from "../db/schema.js";
import { hashPassword, verifyPassword } from "../utils/hash.js";
import { generateReferralCode } from "../utils/referral_code.js";
import { generateTotpSecret } from "../utils/totp.js";
export const registerService = async (user: {
    username: string;
    email: string;
    phone: string;
    password: string;
    inviteCode?: string;
}) => {
    try {
        // Create the user first
        const [newUser] = await db.insert(users)
            .values({
                username: user.username,
                email: user.email,
                phone: user.phone,
                twoFactorSecret: generateTotpSecret(),
                lastLogin: new Date(),
                vipTier: 'standard',
            })
            .returning();

        // Create password record
        await db.insert(passwords)
            .values({
                userId: newUser.id,
                password: await hashPassword(user.password),
                lastChanged: new Date()
            });

        // Enable bonus
        await db.insert(newBonus).values({ userId: newUser.id });

        // Handle referral if inviteCode exists
        if (user.inviteCode) {
            // First find the referrer by their referral code
            const referrer = await db.query.referrals.findFirst({
                where: eq(referrals.referralCode, user.inviteCode)
            });

            if (referrer) {
                // Create referral relationship
                await db.insert(referrals)
                    .values({
                        referrerId: referrer.referrerId,
                        referredId: newUser.id,
                        referralCode: generateReferralCode(),
                        bonusAmount: '50',
                        bonusStatus: 'pending'
                    });
            }
        }

        // Always generate a referral code for the new user
        await db.insert(referrals)
            .values({
                referrerId: newUser.id,
                referredId: newUser.id,
                referralCode: generateReferralCode(),
                bonusAmount: '0',
                bonusStatus: 'completed',
                isSelfReferral: true
            });

        return newUser;
    } catch (error) {
        console.error('Registration error:', error);

        // Handle specific error cases
        if (error instanceof Error) {
            if (error.message.includes('unique constraint')) {
                throw new Error('Username, email or phone already exists');
            }
            if (error.message.includes('violates foreign key constraint')) {
                throw new Error('Invalid referral code');
            }
        }

        throw new Error('Registration failed');
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

export const lastLoginUpdate = async (id:string) => {
    await db.update(users).set({lastLogin: new Date()}).where(eq(users.id,id)).returning().execute()
}