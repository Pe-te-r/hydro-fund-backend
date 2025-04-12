import { db } from "../../db/db.js"

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