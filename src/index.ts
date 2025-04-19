import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { users_api } from './users/users.route.js'
import { auth_api } from './auth/auth.route.js'
import 'dotenv/config'
import { cors } from 'hono/cors'
import { bonusApi } from './bonus/bonus.route.js'
import { settingsApi } from './settings/settings.route.js'
import { email_route } from './email/emai.route.js'
import { dashboardApi } from './dashboard/dashboard.route.js'
import { adminUsersApi } from './admin/users/users.route.js'
import { withdraw_route } from './withdraw/withdraw.route.js'
import { investApi } from './invest/invest.route.js'



const app = new Hono()

app.use('/*', cors())

app.route('/',auth_api)
app.route('/',users_api)
app.route('/',bonusApi)
app.route('/', settingsApi)
app.route('/', email_route)
app.route('/', dashboardApi)
app.route('/', adminUsersApi)
app.route('/', withdraw_route)
app.route('/', investApi)



app.get('/', (c) => {
  return c.text('Hello Hono!')
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
