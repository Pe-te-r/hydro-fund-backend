import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { users_api } from './users/users.route.js'
import { auth_api } from './auth/auth.route.js'

const app = new Hono()

app.route('/',auth_api)
app.route('/',users_api)



app.get('/', (c) => {
  return c.text('Hello Hono!')
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
