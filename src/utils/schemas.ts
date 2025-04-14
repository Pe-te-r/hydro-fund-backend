import { z } from "zod";

export const registerSchema = z.object({
    username: z.string(),
    phone:z.string(),
    email: z.string().email(),
    password: z.string(),
    inviteCode:z.string().optional()
    
});

export const loginSchema = z.union([
    z.object({ username: z.string(), password: z.string() }),
    z.object({ phone: z.string(), password: z.string() }),
    z.object({ email: z.string(), password: z.string() }),
]);


export const sendEmailSchema = z.object({
    id: z.string(),
})

export const updateDetails = z.object({
    email: z.string().email().optional(),
    username: z.string().min(3).optional(),
    phone: z.string().min(6).optional(),
    twoFactorSecretCode: z.string().optional(),
    password: z.object({
        old: z.string().min(6),
        new: z.string().min(6)
    }).optional(),
});

export interface updateData {
    password?: {
        old: string;
        new: string;
    };
    email?: string;
    username?: string
    phone?: string;
    code?: string;
    twoFactorSecret?: string;
    twoFactorEnabled?: boolean;
}
export const codeType  = z.object({
    code:z.string()
})

export const withdrawData = z.object({
    userId: z.string(),
    amount: z.string(),
})