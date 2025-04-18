import { Hono } from "hono";
import { getAdminDashboard, getDashboard } from "./dashboard.controller.js";

export const dashboardApi = new Hono().basePath('/dashboard')


dashboardApi.get('/', getAdminDashboard)
dashboardApi.get('/:id', getDashboard)