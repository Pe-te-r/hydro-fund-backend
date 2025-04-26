import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from './schema.js'
import 'dotenv/config'



export const db = drizzle({
    connection: {
        connectionString: process.env.DATABASE_URL!,
        database: 'investment'
    },
    schema: schema
});
