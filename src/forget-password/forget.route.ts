import { Hono } from "hono";
import { changePasswordController, forgetPasswordController } from "./forget.controller.js";
import { forgetSchema, newPasswordSchema } from "../utils/schemas.js";
import { validate } from "../utils/validator.js";

export const forgetPassword = new Hono().basePath('/forget')

forgetPassword.post('/', validate(forgetSchema), forgetPasswordController)
forgetPassword.post('/new', validate(newPasswordSchema),changePasswordController)