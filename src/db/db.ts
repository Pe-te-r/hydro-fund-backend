// Make sure to install the 'pg' package 
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from './schema.js'

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});
const db = drizzle({ client: pool,schema });

