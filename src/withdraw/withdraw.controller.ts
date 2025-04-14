import type { Context } from "hono";
import { validate as isValidUUID } from 'uuid';
import { OneUserServiceId } from "../users/users.service.js";
import { widthdrawService } from "./withdraw.service.js";

export const widthdraw_route = async (c: Context) => {
    try {

        const data = c.get('validatedData')
        console.log(data)

        const user_exits = await OneUserServiceId(data.id)
        if (!user_exits) {
            return c.json({ status: 'error', message: 'user not found', data: false }, 404)
        }
        return c.json({ status: 'success', message: 'withdraw process started', data: false }, 200)
        

    } catch (error) {
        console.log(error)
    }
}

export const get_details = async (c: Context) => {
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
        console.log(user_exits)
        
        return c.json({ status: 'success', message: 'retrival was success', data: {phone:user_exits.phone,amount:user_exits.balance} }, 200)

        
    } catch (error) {
        console.log(error)
    }
}