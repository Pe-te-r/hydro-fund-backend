import type { Context } from "hono";
import { getAllUsers } from "./users.service.js";

export const adminUsers = async (c: Context) => {
    try {
        const users = await getAllUsers()
        console.log(users)
        if (!users) {
            return c.json({ status:'error',message:'no user found'},404)
        }
        return c.json({ status:'success',message:'users found',data:{users}},200)
    } catch (error) {
        return c.json({status:'error',message:'an error occured'},500)
    }
}