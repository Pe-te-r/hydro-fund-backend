import type { Context } from "hono";
import { validate as isValidUUID } from 'uuid';
import { disable2FaAuth, settingsServiceGet, updateUserSettings } from "./settings.service.js";
import { OneUserServiceId } from "../users/users.service.js";
import { verifyTotpCode } from "../utils/totp.js";
import { mailer } from "../utils/mailer.js";
import { getBrowser, getDeviceType, getLocationFromIp } from "../forget-password/forget.controller.js";



export const settingsController = async (c: Context) => {
    try {
        const id = c.req.param('id')

        if (!isValidUUID(id)) {
            return c.json(
                { status: 'error', message: 'Invalid user ID format' }, 400
            );
        }
        const results = await settingsServiceGet(id)

        if (!results) {
            return c.json({ status: 'error', message: 'data not found' }, 400)

        }

        return c.json({ status: 'success', message: 'data retrived success', data: results })


    } catch (error) {
        return c.json({ status: 'error', message: 'unknow error occured' }, 500)
    }
}

export const updateSettings = async (c: Context) => {
    try {
        const id = c.req.param('id')

        // Get additional security info from request
        const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'Unknown IP';
        const userAgent = c.req.header('user-agent') || 'Unknown browser';
        const location = await getLocationFromIp(ip); // You'll need to implement this

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
        const emailData = {
            template: 'password_changed',
            to: user_exits.email,    
            data: {
                username: user_exits.username,
                email: user_exits.email,
                changeDate: new Date().toLocaleString(),
                location: location || 'Unknown location',
                ip: ip,
                device: getDeviceType(userAgent), // Implement this helper
                browser: getBrowser(userAgent),   // Implement this helper
                supportEmail: 'support@yourdomain.com',
                contactPhone: '+1 (555) 123-4567'
            }
        };
        console.log(data)
        // check for otp and verification
        if (data.twoFactorSecretCode && verifyTotpCode(user_exits.twoFactorSecret, data.twoFactorSecretCode)) {
            if (user_exits.twoFactorEnabled && !data.twoFactorEnabled) {
                console.log('one')
                const results = await disable2FaAuth(id)
                // const results = await updateUserSettings(id, { twoFactorEnabled: data.twoFactorEnabled })
                console.log(results)
                if (results) {
                    await mailer.sendMail(user_exits.email, 'disable', { username: user_exits.username });
                    return c.json({ status: 'success', message: '2Fa disabled successfully', data: true })
                }
                return c.json({ status: 'error', message: '2Fa not disabled', data: false }, 400)
            }
            if (!user_exits.twoFactorEnabled) {
                const results = await updateUserSettings(id, { twoFactorEnabled: true, }, emailData)
                if (results.success) {
                    await mailer.sendMail(user_exits.email, '2fa',{username:user_exits.username});
                    return c.json({ status: 'success', message: '2Fa enabled successfully', data: true })
                }
                return c.json({ status: 'error', message: '2Fa not enabled', data: false }, 400)

                // check for otp failure
            }
        }
        else if (data.twoFactorSecretCode && !verifyTotpCode(user_exits.twoFactorSecret, data.twoFactorSecretCode)) {
            return c.json({ status: 'error', message: '2Fa code not verified', data: false }, 400)

        }

        const results = await updateUserSettings(id, data, emailData)


        if (results.success === false) return c.json({ status: 'error', message:results.message, data: false }, 403)
        return c.json({ status: true, message: " update successfully", data: true }, 200)

    } catch (error) {

        return c.json({ status: 'error', message: error instanceof Error ? error.message : 'unknow error occured' }, 500)
    }
}
