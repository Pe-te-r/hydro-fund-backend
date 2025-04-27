import type { Context } from "hono";
import { email_exits, phone_exits, username_exits } from "../auth/auth.service.js";
import { mailer } from "../utils/mailer.js";
import { changePasswordService } from "./forget.service.js";
import { generateRandomCode } from "../utils/totp.js";
import { updateUserSettings } from "../settings/settings.service.js";

export const forgetPasswordController = async (c: Context) => {
    try {
        const data = c.get('validatedData')
        let user_exits=null;
        
        if ('email' in data) {
            user_exits = await email_exits(String(data['email']))    
        }
        if ('phone' in data) {
            user_exits = await phone_exits(String(data['phone']))    
        }
        if ('username' in data) {
            user_exits = await username_exits(String(data['username']))    
        }
        if (!user_exits) {
            return c.json({'status':'error','message':'user not found'},404)
        }
        if (user_exits.twoFactorEnabled) {
            return c.json({status:'success',message:'enter your otp to change password',data:{otp:true}},200)
        }
        const code = generateRandomCode()
        const results = await updateUserSettings(user_exits.id, { code })
        if (results.success) {
            const sendEmailResult = await mailer.sendMail(user_exits.email, 'code', {code:code,username:user_exits.username},);
            if (!sendEmailResult.success) {
                return c.json({status:'error',message:'code not sent',data:false})
            } else {
                return c.json({status:'success',message:'Code sent to email',data:{code:true}})
            }
        }
        return c.json({status:'errror',message:'try again code not sent to email',data:false},400)        
         
    } catch (error) {
        console.log(error)
        return c.json({status:'error',message:'an error occured'},500)
    }
}


export const changePasswordController = async (c: Context) => {
    try {
        const data = c.get('validatedData');

        // Get additional security info from request
        const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'Unknown IP';
        const userAgent = c.req.header('user-agent') || 'Unknown browser';
        const location = await getLocationFromIp(ip); // You'll need to implement this

        let user_exists = null;

        if ('email' in data) {
            user_exists = await email_exits(String(data['email']));
        } else if ('phone' in data) {
            user_exists = await phone_exits(String(data['phone']));
        } else if ('username' in data) {
            user_exists = await username_exits(String(data['username']));
        }

        if (!user_exists) {
            return c.json({ 'status': 'error', 'message': 'User not found' }, 404);
        }

        if (!('password' in data)) {
            return c.json({ status: 'error', message: 'Password not provided' }, 400);
        }

        const results = await changePasswordService(user_exists.id, data.password);

        if (results) {
            // Prepare email data with security info
            const emailData = {
                template: 'password_changed',
                to: user_exists.email,
                data: {
                    username: user_exists.username,
                    email: user_exists.email,
                    changeDate: new Date().toLocaleString(),
                    location: location || 'Unknown location',
                    ip: ip,
                    device: getDeviceType(userAgent), // Implement this helper
                    browser: getBrowser(userAgent),   // Implement this helper
                    supportEmail: 'support@yourdomain.com',
                    contactPhone: '+1 (555) 123-4567'
                }
            };
            await mailer.sendMail(user_exists.email, 'forget', {...emailData.data});

            return c.json({
                status: 'success',
                message: 'Password updated successfully'
            }, 200);
        }

        return c.json({
            status: 'error',
            message: 'Password not updated. Please try again.'
        }, 400);

    } catch (error) {
        console.error('Password change error:', error);
        return c.json({
            status: 'error',
            message: 'An error occurred while processing your request'
        }, 500);
    }
};

// Helper functions (implement these or use libraries)
export async function getLocationFromIp(ip: string): Promise<string> {
    try {
        // Clean IP if multiple IPs are forwarded
        const cleanIp = ip.split(',')[0].trim();

        const response = await fetch(`http://ip-api.com/json/${cleanIp}`);
        const data = await response.json();

        if (data.status === 'success') {
            const city = data.city || '';
            const country = data.country || '';
            return `${city}${city && country ? ', ' : ''}${country}` || 'Unknown location';
        } else {
            return 'Unknown location';
        }
    } catch (error) {
        console.error('Failed to fetch location:', error);
        return 'Unknown location';
    }
}


export function getDeviceType(userAgent: string): string {
    // Simple device detection
    if (/mobile/i.test(userAgent)) return 'Mobile';
    if (/tablet/i.test(userAgent)) return 'Tablet';
    if (/windows|linux|mac/i.test(userAgent)) return 'Desktop';
    return 'Unknown device';
}

export function getBrowser(userAgent: string): string {
    // Simple browser detection
    if (/chrome/i.test(userAgent)) return 'Chrome';
    if (/firefox/i.test(userAgent)) return 'Firefox';
    if (/safari/i.test(userAgent)) return 'Safari';
    if (/edge/i.test(userAgent)) return 'Edge';
    if (/opera/i.test(userAgent)) return 'Opera';
    return 'Unknown browser';
}