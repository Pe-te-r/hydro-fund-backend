import { eq } from "drizzle-orm"
import { db } from "../db/db.js"
import { users } from "../db/schema.js"

export const settingsServiceGet = async (id:string) => {
   return await db.query.users.findFirst({
        where: eq(users.id, id),
        columns: {
            email: true,
            username: true,
            phone: true,
            twoFactorSecret: true,
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