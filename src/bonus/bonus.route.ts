import { Hono } from "hono";
import { AccountBonusController, ClaimBonusController } from "./bonus.controller.js";

export const bonusApi = new Hono().basePath('/bonus')

bonusApi.patch('/new/:id', ClaimBonusController)
bonusApi.patch('/account/:id', AccountBonusController)