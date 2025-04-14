import { Hono } from "hono";
import { validate } from "../utils/validator.js";
import { withdrawData } from "../utils/schemas.js";
import { get_details, widthdraw_route } from "./withdraw.controller.js";

export const withdraw_route = new Hono().basePath('/withdraw')

withdraw_route.post('/', validate(withdrawData), widthdraw_route)
withdraw_route.get('/:id', get_details)