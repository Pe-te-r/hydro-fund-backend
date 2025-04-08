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


export const updateDetails = z.object(
    {
        email: z.string().optional() ,
        username: z.string().optional(),
        phone: z.string().optional(),
        twoFactoreSecret: z.string().optional(),
        password: z.string().optional(),
        code:z.string().optional(),
    },
)