import { Hono } from "hono";
import { ClaimBonusController } from "./bonus.controller.js";

export const bonusApi = new Hono().basePath('/bonus')

bonusApi.patch('/:id', ClaimBonusController)