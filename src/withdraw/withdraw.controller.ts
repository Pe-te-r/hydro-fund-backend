import type { Context } from "hono";
import { validate as isValidUUID } from 'uuid';
import { OneUserServiceId } from "../users/users.service.js";
import { approveTransactionService, cancelWithdrawService, getTransaction, processWithdrawal, transactionHistory, transactionsHistoryService } from "./withdraw.service.js";

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
        const expectedFee = amount * 0.1;
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

export const getAllHistory = async (c: Context) => {
    try {
        const results = await transactionHistory()
        if (results.length > 0) {
            return c.json({ status: 'success', message: 'withdraw process started', data: results }, 200)
        }
        return c.json({ status: 'error', message: 'no pending transaction', data: false }, 400)
    } catch (error) {
        
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

export const approveController = async (c: Context) => {
    try {
        // const id = c.req.param('id')

        const data = await c.req.json()
        console.log(data)
        const id = data['id']
        if (!isValidUUID(id)) {
            return c.json(
                { status: 'error', message: 'Invalid user ID format' }, 400
            );
        }
        const transactions_exits = await getTransaction(id)
        if (!transactions_exits) {
            return c.json({ status: 'error', message: 'transaction not found', data: false }, 404)
        }
        const results = await approveTransactionService(id)
        if (results) return c.json({ status: 'success', message: 'approval done' },200)
        return c.json({status:'error',message:'approval not done'},400)

    } catch (error) {
         console.log(error)
        return c.json({ status: 'error', message: 'an error', data: false }, 500)
        
    }
}

export const transactionsController = async (c: Context) => {
    try {
        const id = c.req.param('id')
        const isAdmin = c.req.query('admin') === 'true';

        if (!isValidUUID(id)) {
            return c.json(
                { status: 'error', message: 'Invalid user ID format' }, 400
            );
        }

        const user_exits = await OneUserServiceId(id)
        if (!user_exits) {
            return c.json({ status: 'error', message: 'user not found', data: false }, 404)
        }
        
        const info = await transactionsHistoryService(id,isAdmin)
        if (info) return c.json({ status: 'success', message: 'transactions retrived successfull', data: info }, 200)
        return c.json({ status: 'error', message: 'no transactions history', data: false }, 404)
        
    } catch (error) {
        console.log(error)
        return c.json({ status: 'error', message: 'an error', data: false }, 500)
        
    }
}

type Role = "user" | "admin"

export const transactionCancel = async (c: Context) => {
    try {
        const id = c.req.param('id')
        console.log(c.req.query('admin'))
        const admin = c.req.query('admin') === 'true'
        let user: Role = 'user'
        if (admin) user = 'admin'

        const data = await c.req.json()
        if (!isValidUUID(id)) {
            return c.json(
                { status: 'error', message: 'Invalid user ID format' }, 400
            );
        }
        const transactions_exits = await getTransaction(id)
        if (!transactions_exits) {
            return c.json({ status: 'error', message: 'transaction not found', data: false }, 404)
        }

        const result = await cancelWithdrawService(id, user,data?.reason)
        return c.json({ status: result.success, message: result.message },200)
        

    } catch (error) {
        console.log(error)
        return c.json({ status: 'error', message: 'an error', data: false }, 500)
    }
}