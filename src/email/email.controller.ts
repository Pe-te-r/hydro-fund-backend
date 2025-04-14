import type { Context } from "hono"
import { validate as isValidUUID } from 'uuid';
import { OneUserServiceId } from "../users/users.service.js";
import { generateRandomCode } from "../utils/totp.js";
import { updateUserSettings } from "../settings/settings.service.js";
import { mailer } from "../utils/mailer.js";


export const send_email = async (c:Context) => {
    try {
        const id = c.req.param('id')
        console.log(id)
        
        if (!isValidUUID(id)) {
            return c.json(
                { status: 'error', message: 'Invalid user ID format' }, 400
            );
        }
        const user_exits = await OneUserServiceId(id)
        if (!user_exits) {
            return c.json({status:'error',message:'user not found',data:false},404)
        }

        const code = generateRandomCode()
        console.log('update code',code)
        const results = await updateUserSettings(id, { code })
        console.log('user code',user_exits.code)
        if (results.success) {
            const sendEmailResult = await mailer.sendMail(user_exits.email, 'code',  code);
            if (!sendEmailResult.success) {
                // console.error('Email failed to send:', sendEmailResult.message);
                // if (sendEmailResult.error) {
                //     console.error('Error details:', sendEmailResult.error);
                // }
                return c.json({status:'error',message:'code not sent',data:false})
                // Handle the failure (e.g., retry, notify admin, etc.)
            } else {
                console.log('Email sent successfully:', sendEmailResult.message);
                return c.json({status:'success',message:'Code sent to email',data:true})
            }
        }
        return c.json({status:'errror',message:'try again code not sent to email',data:false},400)


        
    } catch (error) {
        return c.json({status:'error',message:'an error occured',data:false},500)
    }
}

export const verifyCode = async (c: Context) => {
    try {
        const id = c.req.param('id')
        console.log(id)

        if (!isValidUUID(id)) {
            return c.json(
                { status: 'error', message: 'Invalid user ID format' }, 400
            );
        }
        const user_exits = await OneUserServiceId(id)
        if (!user_exits) {
            return c.json({ status: 'error', message: 'user not found', data: false }, 404)
        }
        const data = c.get('validatedData')
        console.log(data)
        console.log(user_exits.code)
        if (user_exits.code === data?.code) {
            return c.json({status:'success',message:'code was verified',data:true},200)
        }
        return c.json({status:'error',message:'verification failed',data:false},400)
    } catch (error) {
        return c.json({status:'error',message:'an error occured',data:false},500)
        
    }
}