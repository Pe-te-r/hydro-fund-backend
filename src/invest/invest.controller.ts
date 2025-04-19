import type { Context } from "hono";
import { validate as isValidUUID } from 'uuid';
import { getUserOrders, saveOrderToDatabase } from "./invest.service.js";
import { OneUserServiceId } from "../users/users.service.js";

export const getInvest = async(c:Context) => {
    try {
        return c.json({status:'success',message:'success retrival',data:'investements'})
    } catch (error) {
        console.log(error)
        return c.json({status:'error',message:'an error occured'},500)
    }
}

export const getUserInvest = async (c: Context) => {
    try {
        const id = c.req.param('id')
        
        if (!isValidUUID(id)) {
            return c.json({ status: 'error', message: 'Invalid user ID format' }, 400);
        }
        
        const user_exits = await OneUserServiceId(id)
        if (!user_exits) {
            return c.json({status:'error',message:'user not found',data:false},404)
        }
        const orders = await getUserOrders(id)
        return c.json({status:'success',message:'success retrival',data:orders})
    } catch (error) {
        return c.json({status:'error',message:'an error occured'},500)
        
    }
}

export const addInvest = async (c: Context) => {
    try {
        const data = await c.req.json()
        console.log(data)
        // const data = c.get('validatedData')
        c
        if (!isValidUUID(data.userId)) {
            return c.json({ status: 'error', message: 'Invalid user ID format' }, 400);
        }

        const user_exits = await OneUserServiceId(data.userId)
        if (!user_exits) {
            return c.json({ status: 'error', message: 'user not found', data: false }, 404)
        }
        if ((user_exits.balance || 0) < data.totalAmount) {
            return c.json({status:'error',message:'insufficient balance'},400)
            
        }
        const { success, orderId, error } = await saveOrderToDatabase(data);

        if (!success) {
            return c.json(
                { status: 'error', message: error || 'Failed to save order' },
                500
            );
        }

        return c.json({status: 'success',message: 'Order saved successfully',orderId},201);
        
    } catch (error) {
        console.log(error)
        return c.json({status:'error',message:'an error occured'},500)
        
    }
}