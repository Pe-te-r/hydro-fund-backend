import type { Context } from "hono";
import { correct_password, email_exits, phone_exits, registerService, username_exits } from "./auth.service.js";
import type { SelectUser } from "../db/schema.js";

export const register_controller = async (c: Context) => {
    try {
        const data = c.req.addValidatedData
        const conflicts: string[] = [];

        // Check each field and collect conflicts
        if ('email' in data && await email_exits(String(data.email))) {
            conflicts.push('email');
        }
        if ('phone' in data && await phone_exits(String(data.phone))) {
            conflicts.push('phone');
        }
        if ('username' in data && await username_exits(String(data.username))) {
            conflicts.push('username');
        }

        if (conflicts.length > 0) {
            return c.json({
                status: 'error',
                message: `${conflicts.join(', ')} already exists`,
                error: { conflicts } 
            }, 409);
        }

        const result = await registerService(data);
        return c.json({
            status: 'success',
            message: "User registered successfully",
            data: result
        }, 201);

    } catch (error) {
        console.log(error)
        return c.json({ 'error':'error'},500)
    }
}

export const login_controller = async (c: Context) => {c
    try {
        const data = c.req.addValidatedData
        let user_exits = null;

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
        if ('password' in data && user_exits && await correct_password(String(user_exits.id), String(data['password']))) {
            
            return c.json({"status":'success','message':'success login', user_exits })
        }
        return c.json(user_exits)
    } catch {
        
        return c.json({ 'error':'error'})
    }
}