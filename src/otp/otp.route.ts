import { Hono } from "hono";
import { validate } from "../utils/validator.js";
import { codeSchema, otpSchema } from "../utils/schemas.js";
import { verifyCode, verifyOtp } from "./otp.controller.js";

export const otpRoute = new Hono().basePath('/verify')

otpRoute.post('/otp', validate(otpSchema), verifyOtp)
otpRoute.post('/code', validate(codeSchema), verifyCode)

