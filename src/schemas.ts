import { z } from "zod";

export const userSchema = z.object({
    username: z.string(),
    phone:z.string(),
    email: z.string().email(),
    password: z.string(),
    referral:z.string().optional()
    
});

