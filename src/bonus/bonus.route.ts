import { Hono } from "hono";
import { AccountBonusController, ClaimBonusController } from "./bonus.controller.js";
import { baseAuth } from "../utils/auth.js";

export const bonusApi = new Hono().basePath('/bonus')

bonusApi.use(baseAuth())

bonusApi.patch('/new/:id', ClaimBonusController)
bonusApi.patch('/account/:id', AccountBonusController)