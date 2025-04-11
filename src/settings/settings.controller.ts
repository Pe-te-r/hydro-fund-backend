import type { Context } from "hono";
import { validate as isValidUUID } from 'uuid';
import { settingsServiceGet, updateUserSettings } from "./settings.service.js";
import {  OneUserServiceId } from "../users/users.service.js";


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

        const user_exits = await OneUserServiceId(id)
        console.log(user_exits)
        console.log('one')
        if (!user_exits) {
            return c.json({status:'error',message:'user not found'},404)
        }
        const data = c.get('validatedData')
        console.log(data)

        const results = await updateUserSettings(id, data)
        console.log(results)
        

        if( results.success === false)return c.json(results,403)
        return c.json(results,200)
            
    } catch (error) {
        // console.log(error)
        return c.json({status:'error',message:'unknow error occured'},500)
    }
}