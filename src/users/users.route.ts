import { Hono } from "hono";
import { allUsersController, userController } from "./users.controller.js";
import { baseAuth } from "../utils/auth.js";

export const users_api = new Hono().basePath('/users')

users_api.use('/*', baseAuth())

users_api.get('/',allUsersController)
users_api.get('/:id',userController )
users_api.patch('/:id',)