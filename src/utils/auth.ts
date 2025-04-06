import jwt from 'jsonwebtoken';
import CryptoJS from 'crypto-js';
import type { Next,Context } from 'hono';



export function generateUserToken(userId: string, email: string,role:string='user') {
    // 1. Encrypt sensitive data
    const encryptedData = CryptoJS.AES.encrypt(
        JSON.stringify({ userId, email,role }),
        process.env.ENCRYPTION_KEY!
    ).toString();

    // 2. Create JWT with encrypted payload
    return jwt.sign(
        { data: encryptedData },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' } 
    );
}


export const userAuth = async (c:Context,next: Next) => {

    const authHeader = c.req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return c.json({ status:'error',message: 'Authorization header missing or invalid' }, 401);
    }

    const token = authHeader.split(' ')[1];

    try {
        // 1. Verify JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { data: string };

        // 2. Decrypt payload
        const bytes = CryptoJS.AES.decrypt(decoded.data, process.env.ENCRYPTION_KEY!);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);

        if (!decrypted) {
            return c.json({"status":'error','message':'Token decryption failed' }, 401);
        }

        // 3. Parse and validate payload
        const payload = JSON.parse(decrypted);
        if (!payload.userId || !payload.email || !payload.role) {
            return c.json({ status:'error',message: 'Invalid token payload' }, 401);
        }

        // 4. Attach user to context
        c.set('user', payload);

        // Proceed to controller
        return await next();

    } catch (err) {
        // Handle specific error cases
        if (err instanceof jwt.TokenExpiredError) {
            return c.json({status:'error', message: 'Token expired' }, 401);
        }
        if (err instanceof jwt.JsonWebTokenError) {
            return c.json({status:'error', message: 'Invalid token' }, 401);
        }
        return c.json({ status:'error',message: 'Authentication failed' }, 500);
    }
}