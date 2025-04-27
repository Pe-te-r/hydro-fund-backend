import type { Context } from "hono";
import { validate as isValidUUID } from "uuid";
import { depositCreateService, depositService, updateDepositService } from "./deposit.service.js";


export const getAllDeposit = async (c: Context) => {
    try {
        const all_deposit = await depositService()
        if (!all_deposit) {
            return c.json({status:'error',message:'no deposit found'},404)
        }
        return c.json({status:'success',message:'deposit retrived',data:all_deposit},200)
        
    } catch (error) {
        console.log(error)
        return c.json({ status: 'error', message: 'an error occured' }, 500)
        
    }
}

export const createDeposit = async (c: Context) => {
    try {
        const data = c.get('validatedData')
        const results = await depositCreateService(data)
        if (results) {
            return c.json({status:'success',message:'deposit notification sent to admin'},200)
        }
        return c.json({status:'error',message:'deposit claim failed'},400)
    } catch (error) {
        console.log(error)
        return c.json({ status: 'error', message: 'an error occured' }, 500)
    }
}

export const updateDeposit = async (c: Context) => {
    try {
        const id = c.req.param('id')
        
        if (!isValidUUID(id)) {
            return c.json(
                { status: 'error', message: 'Invalid user ID format' }, 400
            );
        }
        const updated = await updateDepositService(id)
        if (updated) {
            return c.json({status:'success',mesage:'deposit update success'},200)
        }
        return c.json({ status: 'error', mesage: 'deposit not updated' }, 400)
    } catch (error) {
        return c.json({ status: 'error', message: 'an error occured' }, 500)
    }
}