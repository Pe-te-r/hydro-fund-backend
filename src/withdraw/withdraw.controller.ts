import type { Context } from "hono";
import { validate as isValidUUID } from 'uuid';
import { OneUserServiceId } from "../users/users.service.js";

export const widthdraw_route = async (c: Context) => {
    try {
        const id = c.req.param('id')

        if (!isValidUUID(id)) {
            return c.json(
                { status: 'error', message: 'Invalid user ID format' }, 400
            );
        }

        const user_exits = await OneUserServiceId(id)
        if (!user_exits) {
            return c.json({ status: 'error', message: 'user not found', data: false }, 404)
        }
        

    } catch (error) {
        console.log(error)
    }
}

export const get_details = async (c: Context) => {
    try {
        
    } catch (error) {
        console.log(error)
    }
}