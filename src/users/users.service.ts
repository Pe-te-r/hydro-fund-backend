import { eq } from "drizzle-orm"
import { db } from "../db/db.js"
import { users } from "../db/schema.js"

export const getAllUserService = async() => {
    return await db.query.users.findMany()
}

export const OneUserService = async (id:string) => {
    return await db.query.users.findFirst({
        where:eq(users.id,id)
    })
}