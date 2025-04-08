import type { Context } from "hono";
import { validate as isValidUUID } from 'uuid';
import { settingsServiceGet } from "./settings.service.js";


export const settingsController = async (c: Context) => {
    try {
        const id = c.req.param('id')

        if (!isValidUUID(id)) {
            return c.json(
               { status: 'error', message: 'Invalid user ID format' },400
            );
        }
        const results = await settingsServiceGet(id)
        console.log(results)
        if (!results) {
            return c.json({ status: 'error', message: 'data not found' },400)
            
        }

        return c.json({status:'success',message:'data retrived success',data:results})


    } catch (error) {
        return c.json({status:'error',message:'unknow error occured'},500)
    }
}

export const updateSettings = async (c: Context) => {
    try {
        const id = c.req.param('id')

        if (!isValidUUID(id)) {
            return c.json(
                { status: 'error', message: 'Invalid user ID format' }, 400
            );
        }
        
        return c.json({status:'error',message:'update was success'},200)
            
    } catch (error) {
        return c.json({status:'error',message:'unknow error occured'},500)
    }
}