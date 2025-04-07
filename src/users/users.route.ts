import { Hono } from "hono";
import { allUsersController, userController } from "./users.controller.js";
import { userAuth } from "../utils/auth.js";

export const users_api = new Hono().basePath('/users')

users_api.use('/*',userAuth)

users_api.get('/',allUsersController)
users_api.get('/:id',userController )
users_api.patch('/:id',)