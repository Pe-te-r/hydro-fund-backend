import type { Context } from "hono";
import { registerService } from "./auth.service.js";

export const register_controller = async (c: Context) => {
    try {
        const data = c.req.addValidatedData
        const result= await registerService(data)
        return c.json({"status":'success',"message":"the user is registered success", "data":result })
    } catch (error) {
        console.log(error)
        return c.json({ 'error':'error'})
    }
}

export const login_controller = async (c: Context) => {c
    try {

    } catch {

    }
}