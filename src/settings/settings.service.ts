import { eq } from "drizzle-orm"
import { db } from "../db/db.js"
import { passwords, users } from "../db/schema.js"
import { hashPassword, verifyPassword } from "../utils/hash.js";
import { type updateData } from "../utils/schemas.js"

export const settingsServiceGet = async (id:string) => {
   return await db.query.users.findFirst({
        where: eq(users.id, id),
       columns: {
            id:true,
            email: true,
            username: true,
            phone: true,
            twoFactorSecret: true,
            twoFactorEnabled:true
        },
        with: {
            password: {
                columns: {
                    lastChanged:true
                }
            }
        }
    })
}


export const updateUserSettings = async (userId: string, data: updateData) => {
return await db.transaction(async (tx) => {
    try {
        // Prepare user update data (excluding password)
        const userUpdateData: updateData = {};

        if (data.email) userUpdateData.email = data.email;
        if (data.username) userUpdateData.username = data.username;
        if (data.phone) userUpdateData.phone = data.phone;
        if (data.twoFactorSecret) userUpdateData.twoFactorSecret = data.twoFactorSecret;
        if (data.twoFactorEnabled) userUpdateData.twoFactorEnabled = data.twoFactorEnabled;
        if (data.code) userUpdateData.code = data.code;


        
        // Add other fields as needed

        // If password change is requested
        if (data.password) {
            // Fetch current password hash
            const currentPassword = await tx.query.passwords.findFirst({
                where: eq(passwords.userId, userId)
            });

            if (!currentPassword) {
                throw new Error("Password record not found");
            }

            // Verify old password matches
            const isMatch = await verifyPassword(
                data.password.old,
                currentPassword.password
            );

            if (!isMatch) {
                throw new Error("Current password is incorrect");
            }

            // Hash new password
            const newPasswordHash = await hashPassword(data.password.new);

            // Update password in a separate operation
            await tx.update(passwords)
                .set({
                    password: newPasswordHash,
                    lastChanged: new Date()
                })
                .where(eq(passwords.userId, userId));
        }

        // Update user data if there are changes
        if (Object.keys(userUpdateData).length > 0) {
            await tx.update(users)
                .set(userUpdateData)
                .where(eq(users.id, userId));
        }

        return { success: true, message: "Settings updated successfully" };
    } catch (error) {
        // tx.rollback();
        return {
            success: false,
            message: error instanceof Error ? error.message : "Update failed"
        };
    }
});
};

