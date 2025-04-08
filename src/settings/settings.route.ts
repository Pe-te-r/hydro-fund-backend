import { Hono } from "hono";
import { settingsController, updateSettings } from "./settings.controller.js";
import { validate } from "../utils/validator.js";
import { updateDetails } from "../utils/schemas.js";

export const settingsApi = new Hono().basePath('/settings')

settingsApi.get('/:id', settingsController)
settingsApi.patch('/:id', validate(updateDetails),  updateSettings)