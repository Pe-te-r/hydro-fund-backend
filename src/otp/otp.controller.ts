import type { Context } from "hono";
import { validate as isValidUUID } from 'uuid';
import { email_exits, phone_exits, username_exits } from "../auth/auth.service.js";
import { OneUserServiceId } from "../users/users.service.js";
import { verifyTotpCode } from "../utils/totp.js";

export const verifyOtp = async (c: Context) => {
    try {
        const data = c.get('validatedData')
        let user_exits =null
        if ('email' in data) {
            user_exits = await email_exits(String(data['email']))    
        }
        if ('phone' in data) {
            user_exits = await phone_exits(String(data['phone']))    
        }
        if ('username' in data) {
            user_exits = await username_exits(String(data['username']))    
        }
        if ('id' in data) {
            const id = data['id']
            if (!isValidUUID(id)) {
                return c.json(
                    { status: 'error', message: 'Invalid user ID format' }, 400
                );
            }

            user_exits = await OneUserServiceId(id)
           
        }
        if (!user_exits) {
            return c.json({ status: 'error', message: 'user not found', data: false }, 404)
        }
        if(!user_exits.twoFactorEnabled)return c.json({status:'error',message:'method not allowed'},400)

        if (verifyTotpCode(user_exits.twoFactorSecret, data['otp'])) {
            return c.json({status:'success',message:'otp verified',dat:true},200)
        }
        return c.json({ status: 'error', message: 'otp not verified',data:false }, 400)
        
    } catch (error) {
        console.log(error)
        return c.json({ status: 'error',message:'an error occured'},500)
    }
}

export const verifyCode = async (c: Context) => {
    try {
        const data = c.get('validatedData')
        let user_exits = null
        if ('email' in data) {
            user_exits = await email_exits(String(data['email']))
        }
        if ('phone' in data) {
            user_exits = await phone_exits(String(data['phone']))
        }
        if ('username' in data) {
            user_exits = await username_exits(String(data['username']))
        }
        if ('id' in data) {
            const id = data['id']
            if (!isValidUUID(id)) {
                return c.json(
                    { status: 'error', message: 'Invalid user ID format' }, 400
                );
            }

            user_exits = await OneUserServiceId(id)

        }
        if (!user_exits) {
            return c.json({ status: 'error', message: 'user not found', data: false }, 404)
        }
        
        if (user_exits.code === data['code']) {
            return c.json({ status: 'success', message: 'code verified', data: true }, 200)
            
        } else {
            
            return c.json({ status: 'error', message: 'code not verified verified', data: false }, 400)
        }
                    
    } catch (error) {
        return c.json({ status: 'error',message:'an error occured'},500)
    }
}