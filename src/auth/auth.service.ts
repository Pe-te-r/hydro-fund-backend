import { db } from "../db/db.js";
import { passwords, referrals, users } from "../db/schema.js";

export const registerService = async (user: any) => {
    try {
        const result = await db.transaction(async (tx) => {
            const new_user = await tx.insert(users).values(user).returning().execute();

            await tx.insert(passwords)
                .values({
                    userId: new_user[0].id,
                    password: user['password']
                });

            await tx.insert(referrals)
                .values({
                    userId: new_user[0].id,
                    referralCode: 'new'
                });

            return new_user[0]; 
        });
        return result;
    } catch (error) {
        return false; 
    }
}