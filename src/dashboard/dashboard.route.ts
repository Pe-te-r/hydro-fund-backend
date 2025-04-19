import { Hono } from "hono";
import { getAdminDashboard, getDashboard } from "./dashboard.controller.js";
import { baseAuth } from "../utils/auth.js";

export const dashboardApi = new Hono().basePath('/dashboard')


// dashboardApi.get('/', baseAuth({roles:['admin']}) ,getAdminDashboard)
dashboardApi.get('/',getAdminDashboard)
dashboardApi.get('/:id', baseAuth(),getDashboard)