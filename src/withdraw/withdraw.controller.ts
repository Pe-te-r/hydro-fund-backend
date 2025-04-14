import type { Context } from "hono";
import { validate as isValidUUID } from 'uuid';
import { OneUserServiceId } from "../users/users.service.js";
import { processWithdrawal, transactionsHistoryService } from "./withdraw.service.js";

export const widthdraw_route = async (c: Context) => {
    try {

        const data = c.get('validatedData')
        console.log(data)

        const user_exits = await OneUserServiceId(data.userId)
        if (!user_exits) {
            return c.json({ status: 'error', message: 'user not found', data: false }, 404)
        }

        // Verify amounts first (before transaction)
        const amount = parseFloat(data.amount);

        // Validate the 8% fee calculation
        const expectedFee = amount * 0.08;
        data.fee = expectedFee
        data.netAmount= amount-expectedFee

        if (parseFloat(user_exits.balance ?? '0') > amount) {
            
            const results = await processWithdrawal(data)
            if (results) return c.json({ status: 'success', message: 'withdraw process started', data: data }, 200)
            return c.json({ status: 'error', message: 'withdraw failed to be initiated', data: false }, 400)
        }
    return c.json({ status: 'error', message: 'not enough balance', data: false }, 400)

        
        
        
    } catch (error) {
        console.log(error)
        return c.json({ status: 'error', message: 'an error', data: false }, 500)
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
        
        return c.json({ status: 'success', message: 'retrival was success', data: {phone:user_exits.phone,amount:user_exits.balance} }, 200)
        
        
    } catch (error) {
        console.log(error)
        return c.json({ status: 'error', message: 'an error', data: false }, 500)
    }
}

export const transactionsController = async (c: Context) => {
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
        
        const info = await transactionsHistoryService(id)
        console.log(info)
        if (info) return c.json({ status: 'success', message: 'transactions retrived successfull', data: info }, 200)
        return c.json({ status: 'error', message: 'no transactions history', data: false }, 404)
        
    } catch (error) {
        console.log(error)
        return c.json({ status: 'error', message: 'an error', data: false }, 500)

    }
}