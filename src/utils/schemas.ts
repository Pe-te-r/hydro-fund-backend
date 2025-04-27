import { z } from "zod";

export const registerSchema = z.object({
    username: z.string(),
    phone:z.string(),
    email: z.string().email(),
    password: z.string(),
    inviteCode:z.string().optional()
    
});

export const otpSchema = z.object({
    otp: z.string(),
    email: z.string().optional(),
    phone: z.string().optional(),
    username:z.string().optional(),
    id:z.string().optional()
})

export const codeSchema = z.object({
    code: z.string(),
    email: z.string().optional(),
    phone: z.string().optional(),
    username: z.string().optional(),
    id: z.string().optional()
})


export const newPasswordSchema = z.object({
    email: z.string().optional(),
    phone: z.string().optional(),
    username:z.string().optional(),
    password:z.string()
})

export const forgetSchema = z.object({
    username: z.string().optional(),
    phone: z.string().optional(),
    email:z.string().optional(),
})

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
    twoFactorEnabled: z.boolean().optional(),
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
    amount: z.number(),
    netAmount: z.number(),
    fee: z.number(),
    phone:z.string(),
    admin_info:z.string().optional(),
})

export const depositData = z.object({
userId: z.string(),
amount: z.string(),
phone: z.string(),
code:z.string()

})


const OrderItemSchema = z.object({
    productId: z.number(),
    productName: z.string().min(1),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
    dailyIncome: z.number().nonnegative(),
    totalIncome: z.number().nonnegative(),
    cycle: z.number().int().positive()
});

export const CreateOrderSchema = z.object({
    userId: z.string().uuid(),
    items: z.array(OrderItemSchema).nonempty(),
    totalAmount: z.number().positive(),
});

export const updateUserStatus = z.object({
    status:z.string()
})

// Type derived from the schema
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

export type depositDataType = {
    amount:number,
    phone: string,
    userId:string,
    code: string
}

export type infoEmail = {
        template: string;
        to: string;
        data: {
            username: string;
            email: string;
            changeDate: string;
            location: string;
            ip: string;
            device: string;
            browser: string;
            supportEmail: string;
            contactPhone: string;
        };
}