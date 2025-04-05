import { Hono } from "hono";
import { login_controller, register_controller } from "./auth.controller.js";
import { validate } from "../validator.js";
import { userSchema } from "../schemas.js";

export const auth_api = new Hono().basePath('/auth')

auth_api.post('/register', validate(userSchema),register_controller)
auth_api.post('/login',login_controller)


