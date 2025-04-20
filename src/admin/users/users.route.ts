import { Hono } from "hono";
import { adminUsers, oneUserAdmin, updateUserAdmin } from "./users.controller.js";
import { baseAuth } from "../../utils/auth.js";
import { validate } from "../../utils/validator.js";
import { updateUserStatus } from "../../utils/schemas.js";

export const adminUsersApi = new Hono().basePath('/admin/users')

// adminUsersApi.use(baseAuth({ roles: ['admin'] }))

adminUsersApi.get('/', adminUsers)
adminUsersApi.get('/:id', oneUserAdmin)
adminUsersApi.patch('/:id/status', validate(updateUserStatus) ,updateUserAdmin)