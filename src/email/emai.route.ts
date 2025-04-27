import { Hono } from "hono";
import { send_email, verifyCode } from "./email.controller.js";
import { validate } from "../utils/validator.js";
import { codeType } from "../utils/schemas.js";

export const email_route = new Hono().basePath('/email')

email_route.get('/:id', send_email)
email_route.post('/:id', validate(codeType), verifyCode)
