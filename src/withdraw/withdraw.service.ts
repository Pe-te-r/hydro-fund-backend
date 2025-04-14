import { eq } from "drizzle-orm"
import { db } from "../db/db.js"
import { users, withdrawals } from "../db/schema.js"

export const widthdrawService = async (id:string) => {
    return await db.query.users.findFirst({
        where: eq(users.id, id),
        columns: {
            balance: true,
            phone:true,
        }
    })
}