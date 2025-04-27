import { Hono } from "hono";
import { validate } from "../utils/validator.js";
import { depositData } from "../utils/schemas.js";
import { createDeposit, getAllDeposit, updateDeposit } from "./deposit.controller.js";

export const depositRoute = new Hono().basePath('/deposit')

depositRoute.get('/', getAllDeposit)
depositRoute.post('/', validate(depositData), createDeposit)
depositRoute.patch('/:id', updateDeposit)