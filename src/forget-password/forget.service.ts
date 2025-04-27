import { eq } from "drizzle-orm"
import { db } from "../db/db.js"
import { passwords, users } from "../db/schema.js"
import { hashPassword } from "../utils/hash.js"

export const changePasswordService = async (id: string, password: string) => {
    try {
        await db.update(passwords).set({ password: await hashPassword(password), lastChanged: new Date() }).where(eq(passwords.userId, id))
        return true
    } catch (error) {
        return false    
    }
}