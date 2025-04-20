import type { Context } from "hono";
import { adminUserService, getAllUsers, updateUserStatus } from "./users.service.js";
import {validate as isValidUUID} from 'uuid'
import { OneUserService } from "../../users/users.service.js";

export const adminUsers = async (c: Context) => {
    try {
        const users = await getAllUsers()
        if (!users) {
            return c.json({ status:'error',message:'no user found'},404)
        }
        return c.json({ status:'success',message:'users found',data:{users}},200)
    } catch (error) {
        return c.json({status:'error',message:'an error occured'},500)
    }
}

export const oneUserAdmin = async (c: Context) => {
    try {
        const id = c.req.param('id')
        if (!isValidUUID(id)) {
            return c.json(
                { status: 'error', message: 'Invalid user ID format' },
                400
            );
        }

        const user = await OneUserService(id)
        if (!user) {
            return c.json({ 'status': 'error', 'message': 'user not found' }, 400)
        }
        const results = await adminUserService(id)
        if (results) return c.json({ status:'success',message:'user retrived',data:results},200)
        return c.json({ 'status': 'error', 'message': 'user data not found' }, 400)
    } catch (error) {
        return c.json({status:'error',message:'an error occured'},500)
        
    }
}

export const updateUserAdmin = async (c: Context) => {
    try {
        const id = c.req.param('id')
                if (!isValidUUID(id)) {
                    return c.json(
                        { status: 'error', message: 'Invalid user ID format' },
                        400 
                    );
                }
        
                const user = await OneUserService(id)
                if (!user) {
                    return c.json({'status':'error','message':'user not found'},400)
                }
                
                const data = c.get('validatedData')
                const results = await updateUserStatus(id,data.status)
                if(results)return c.json({status:'success',message:'user blocked'},200)
                return c.json({'status':'error','message':'user not blocked'},400)
            
        
    } catch (error) {
        return c.json({status:'error',message:'an error occured'},500)
    }
}