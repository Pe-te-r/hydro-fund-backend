import type { Context } from "hono";
import { validate as isValidUUID } from 'uuid';
import { accountBonusService, claimBonusService } from "./bonus.service.js";


export const ClaimBonusController = async (c: Context) => {
    try {
        const id = c.req.param('id')

        if (!isValidUUID(id)) {
            return c.json(
                { status: 'error', message: 'Invalid user ID format' },
                400
            );
        }

        const updated = await claimBonusService(id)
        if (!updated) {
            return c.json({status:'error',message:'bonus not saved'},400)
        }
        return c.json({status:'success',message:'bonus claimed'})

    } catch (error) {
        console.log(error)
        return c.json({ status:'error',message:'unknow error occured'},500)
    }
}


export const AccountBonusController = async (c: Context) => {
    try {
        const id = c.req.param('id')
        console.log(id)

        if (!isValidUUID(id)) {
            return c.json(
                { status: 'error', message: 'Invalid user ID format' },
                400
            );
        }
        const updated = await accountBonusService(id)
        console.log(updated)
        if (!updated) {
            return c.json({ status: 'error', message: 'account bonus not saved' }, 400)
        }
        return c.json({ status: 'success', message: 'account bonus claimed' })
        
    } catch (error) {
        console.log(error)
        return c.json({ status:'error',message:'un know error occured'},500)
        
    }
}