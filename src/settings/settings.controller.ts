import type { Context } from "hono";
import { validate as isValidUUID } from 'uuid';
import { settingsServiceGet, updateUserSettings } from "./settings.service.js";
import {  OneUserServiceId } from "../users/users.service.js";
import { verifyTotpCode } from "../utils/totp.js";


export const settingsController = async (c: Context) => {
    try {
        const id = c.req.param('id')

        if (!isValidUUID(id)) {
            return c.json(
               { status: 'error', message: 'Invalid user ID format' },400
            );
        }
        const results = await settingsServiceGet(id)

        if (!results) {
            return c.json({ status: 'error', message: 'data not found' },400)
            
        }

        return c.json({status:'success',message:'data retrived success',data:results})


    } catch (error) {
        return c.json({status:'error',message:'unknow error occured'},500)
    }
}

export const updateSettings = async (c: Context) => {
    try {
        const id = c.req.param('id')

        if (!isValidUUID(id)) {
            return c.json(
                { status: 'error', message: 'Invalid user ID format' }, 400
            );
        }

        const user_exits = await OneUserServiceId(id)
        if (!user_exits) {
            return c.json({status:'error',message:'user not found',data:false},404)
        }
        const data = c.get('validatedData')
        console.log(data.twoFactorSecretCode && verifyTotpCode(user_exits.twoFactorSecret, data.twoFactorSecretCode))

        // check for otp and verification
        if (data.twoFactorSecretCode && verifyTotpCode(user_exits.twoFactorSecret, data.twoFactorSecretCode)) {
            if (user_exits.twoFactorEnabled && data.twoFactorEnabled) {
                const results = await updateUserSettings(id, { twoFactorEnabled: data.twoFactorEnabled })
                if (results.success) return c.json({ status: 'success', message: '2Fa disabled successfully',data:true })
                return c.json({ status: 'error', message: '2Fa not disabled' ,data:false},400)
            }
            // if (user_exits.twoFactorEnabled) {
            //     return c.json({ status: 'success', message:'otp verified'})
            // }
            if (!user_exits.twoFactorEnabled) {
                const results = await updateUserSettings(id, { twoFactorEnabled: true, })
                if (results.success) return c.json({ status: 'success', message: '2Fa enabled successfully',data:true })
                return c.json({ status: 'error', message: '2Fa not enabled' ,data:false},400)
           
            // check for otp failure
            }
        }
            else if (data.twoFactorSecretCode && !verifyTotpCode(user_exits.twoFactorSecret, data.twoFactorSecretCode)) {
            return c.json({ status: 'error', message: '2Fa not verified' ,data:false},400)
            
    }
  
        const results = await updateUserSettings(id, data)
        

        if (results.success === false) return c.json({ status: 'error', message: 'data not update', data: false },403)
        return c.json({status:true,message:'data update successfully',data:true},200)
            
    } catch (error) {
        // console.log(error)
        return c.json({status:'error',message:'unknow error occured'},500)
    }
}