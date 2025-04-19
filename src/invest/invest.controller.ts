import type { Context } from "hono";

export const getInvest = async(c:Context) => {
    try {
        return c.json({status:'success',message:'success retrival',data:'investements'})
    } catch (error) {
        console.log(error)
        return c.json({status:'error',message:'an error occured'},500)
    }
}