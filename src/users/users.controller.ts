import type { Context } from "hono"
import { validate as isValidUUID } from 'uuid';
import { getAllUserService, OneUserService } from "./users.service.js"

export const allUsersController = async (c:Context) => {
    try {
        const users = await getAllUserService()
        if (users.length < 1) {
            return c.json({'status':"error",'message':'no user found'})
        }
        return c.json({'status':'sucess','message':'users retrived success','data':users})
    } catch (error) {
        return c.json({'status':'error','message':'unknow error occured'})
    }
}

export const userController = async (c: Context) => {
    try {
        const id = c.req.param('id')
        if (!isValidUUID(id)) {
            return c.json(
                { status: 'error', message: 'Invalid user ID format' },
                400 
            );
        }

        const user = await OneUserService(id)
        console.log(user)
        if (!user) {
            return c.json({'status':'error','message':'user not found'})
        }
        return c.json({status:'success','message':'user data retrived',data:user})
    } catch (error) {
        console.log(error)
        return c.json({'status':'error','message':'unknow error occured'})
    }
}