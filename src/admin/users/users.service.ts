import { eq } from "drizzle-orm"
import { db } from "../../db/db.js"
import { users } from "../../db/schema.js"

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