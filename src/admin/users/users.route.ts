import { Hono } from "hono";
import { adminUsers } from "./users.controller.js";

export const adminUsersApi = new Hono().basePath('/admin/users')

adminUsersApi.get('/', adminUsers)