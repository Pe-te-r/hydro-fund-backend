import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import 'dotenv/config'
import { users_api } from './users/users.route.js'
import { auth_api } from './auth/auth.route.js'
import { cors } from 'hono/cors'
import { bonusApi } from './bonus/bonus.route.js'
import { settingsApi } from './settings/settings.route.js'
import { email_route } from './email/emai.route.js'
import { dashboardApi } from './dashboard/dashboard.route.js'
import { adminUsersApi } from './admin/users/users.route.js'
import { withdraw_route } from './withdraw/withdraw.route.js'
import { investApi } from './invest/invest.route.js'
import { otpRoute } from './otp/otp.route.js'
import { forgetPassword } from './forget-password/forget.route.js'
import { depositRoute } from './deposit/deposit.route.js'



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
app.route('/', otpRoute)
app.route('/', forgetPassword)
app.route('/', depositRoute)



app.get('/', (c) => {
  return c.text('Hello Hono!')
})

serve({
  fetch: app.fetch,
  port: Number(process.env.PORT) || 3000
}, (info: { port: any }) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
