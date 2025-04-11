import { Hono } from "hono";
import { getDashboard } from "./dashboard.controller.js";

export const dashboardApi = new Hono().basePath('/dashboard')


dashboardApi.get('/:id', getDashboard)