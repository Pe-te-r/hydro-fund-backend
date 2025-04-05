import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from './schema.js'




export const db = drizzle({
    connection: {
        connectionString: process.env.DATABASE_URL!,
        database:'investment'
    },
    schema:schema
});