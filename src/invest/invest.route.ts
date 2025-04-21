import { Hono } from "hono";
import { baseAuth } from "../utils/auth.js";
import { addInvest, getInvest, getInvestClaim, getUserInvest } from "./invest.controller.js";
import { validate } from "../utils/validator.js";
import { CreateOrderSchema } from "../utils/schemas.js";

export const investApi = new Hono().basePath('/invest')

investApi.use(baseAuth())

investApi.post('/', validate(CreateOrderSchema), addInvest)
investApi.post('/',  addInvest)
investApi.get('/',getInvest)
investApi.patch('/:id/claim', getInvestClaim)
investApi.get('/:id/orders', getUserInvest)
