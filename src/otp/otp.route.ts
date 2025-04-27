import { Hono } from "hono";
import { validate } from "../utils/validator.js";
import { otpSchema } from "../utils/schemas.js";
import { verifyOtp } from "./otp.controller.js";

export const otpRoute = new Hono().basePath('/otp')

otpRoute.post('/', validate(otpSchema), verifyOtp)

