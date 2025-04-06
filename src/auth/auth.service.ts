import { eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { passwords, referrals, users } from "../db/schema.js";
import { hashPassword, verifyPassword } from "../utils/hash.js";
import { generateReferralCode } from "../utils/referral_code.js";

export const registerService = async (user: any) => {
    try {
        const result = await db.transaction(async (tx) => {
            const new_user = await tx.insert(users).values(user).returning().execute();
            await tx.insert(passwords)
                .values({
                    userId: new_user[0].id,
                    password: await hashPassword(user['password'])
                });

            await tx.insert(referrals)
                .values({
                    userId: new_user[0].id,
                    referralCode: generateReferralCode()
                });

            return new_user[0]; 
        });
        return result;
    } catch (error) {
        return false; 
    }
}


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
        console.log(password_value)

        if (password_value[0]) {
            return verifyPassword(password,password_value[0]?.password)
        }
        return false
    } catch (error) {
        return false
    }

}