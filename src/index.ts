import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { users_api } from './users/users.route.js'
import { auth_api } from './auth/auth.route.js'
import 'dotenv/config'
import { cors } from 'hono/cors'
import { bonusApi } from './bonus/bonus.route.js'



const app = new Hono()

app.use('/*', cors())

app.route('/',auth_api)
app.route('/',users_api)
app.route('/',bonusApi)



app.get('/', (c) => {
  return c.text('Hello Hono!')
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
