import jwt from 'jsonwebtoken';
import CryptoJS from 'crypto-js';
import type { Next,Context } from 'hono';



export function generateUserToken(userId: string, email: string, role: string='user') {
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



export const baseAuth = (options?: { roles?: ('user' | 'admin')[] }) => {
    return async (c: Context, next: Next) => {
        const authHeader = c.req.header('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return c.json({ status: 'error', token:true ,message: 'Authorization header missing' }, 401);
        }

        const token = authHeader.split(' ')[1];

        try {
            // Verify JWT
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { data: string };

            // Decrypt
            const bytes = CryptoJS.AES.decrypt(decoded.data, process.env.ENCRYPTION_KEY!);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            if (!decrypted) throw new Error('Decryption failed');

            // Parse payload
            const payload = JSON.parse(decrypted);
            if (!payload.userId || !payload.email || !payload.role) {
                throw new Error('Invalid payload');
            }

            // Role check (if specified)
            if (options?.roles && !options.roles.includes(payload.role)) {
                return c.json({ status: 'error', token: false,message: 'Insufficient permissions' }, 403);
            }

            // Attach user to context
            c.set('user', payload);
            return await next();

        } catch (err) {
            if (err instanceof jwt.TokenExpiredError) {
                return c.json({ status: 'error', token: true,message: 'Token expired' }, 401);
            }
            if (err instanceof jwt.JsonWebTokenError) {
                return c.json({ status: 'error', token:true,message: 'Invalid token' }, 401);
            }
            return c.json({ status: 'error', token:false,message: 'Authentication failed' }, 500);
        }
    };
};