import type { Context } from "hono"
import { validate as isValidUUID } from 'uuid';
import { OneUserServiceId } from "../users/users.service.js";
import { generateRandomCode } from "../utils/totp.js";
import { updateUserSettings } from "../settings/settings.service.js";


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
        console.log(code)
        const results = await updateUserSettings(id, { code })
        
        if (results.success) {
            return c.json({status:'success',message:'code sent to email',data:true})
        }
        return c.json({status:'errror',message:'try again code not sent to email',data:false},400)


        
    } catch (error) {
        return c.json({status:'error',message:'an error occured',data:false},500)
    }
}