import { Hono } from "hono";
import { validate } from "../utils/validator.js";
import { loginSchema, registerSchema } from "../utils/schemas.js";
import { login_controller, register_controller } from "./auth.controller.js";

export const auth_api = new Hono().basePath('/auth')

auth_api.post('/register', validate(registerSchema),register_controller)
auth_api.post('/login',validate(loginSchema),login_controller)


