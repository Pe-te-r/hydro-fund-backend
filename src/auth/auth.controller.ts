import type { Context } from "hono";

export const register_controller = async (c: Context) => {
    try {
        const data = c.req.addValidatedData
        console.log(data)
        return c.json(data)
    } catch {
        return c.json({ 'error':'error'})
    }
}

export const login_controller = async (c: Context) => {c
    try {

    } catch {

    }
}