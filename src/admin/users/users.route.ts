import { Hono } from "hono";
import { adminUsers } from "./users.controller.js";
import { baseAuth } from "../../utils/auth.js";

export const adminUsersApi = new Hono().basePath('/admin/users')

adminUsersApi.use(baseAuth({ roles: ['admin'] }))

adminUsersApi.get('/',adminUsers)