import type { Context, Next } from "hono";
import { z } from "zod";

export function validate(schema: z.ZodSchema) {
    return async (c: Context, next: Next) => {
        try {
            const data = await c.req.json();
            const parsedData = schema.parse(data);
            c.set('validatedData',parsedData); 
            await next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                // Handle Zod validation errors
                const errorDetails = error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                    code: err.code
                }));

                return c.json(
                    {
                        status: 'error',
                        message: 'Validation failed',
                        data: {
                            fields: errorDetails.map(e => e.field),
                            details: errorDetails
                        }
                    },
                    422 
                );
            }
            return c.json(
                {
                    status: 'error',
                    message: 'Invalid JSON data',
                    data: null
                },
                400
            );
        }
    };
}