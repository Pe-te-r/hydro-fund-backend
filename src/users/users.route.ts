import { Hono } from "hono";

export const users_api = new Hono().basePath('/users')

users_api.get('/',)
users_api.get('/:id',)
users_api.post('/')
users_api.patch('/')