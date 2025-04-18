import type { Context } from "hono";
import { validate as isValidUUID } from 'uuid';
import { adminDashboardService, getDashBoardService } from "./dashboard.service.js";
import { OneUserService } from "../users/users.service.js";

export const getDashboard = async (c: Context) => {
    try {
        const id = c.req.param('id')
        if (!isValidUUID(id)) {
            return c.json({ status: 'error', message: 'Invalid user ID format' }, 400);
        }
        
        const user = await OneUserService(id)
        if (!user) {
            return c.json({'status':'error','message':'user not found'})
        }
        const results = await getDashBoardService(id)
        console.log(results)
        return c.json(results)
    } catch (error) {
        console.log(error)
        return c.json({status:'error',message:'an error occured'},500)
    }
}

export const getAdminDashboard = async (c: Context) => {
    try {
        const results = await adminDashboardService()
        return c.json({status:'success',message:'info retrived success',data:results})
        
    } catch (error) {
        console.log(error)
        return c.json({status:'error',message:'an error occured'},500)
        
    }
}