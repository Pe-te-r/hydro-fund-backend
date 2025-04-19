import { Hono } from "hono";
import { baseAuth } from "../utils/auth.js";
import { getInvest } from "./invest.controller.js";

export const investApi = new Hono().basePath('/invest')

investApi.use(baseAuth())

investApi.get('/',getInvest)
