import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { profileRouter } from './routes/profile'
import { skillsRouter } from './routes/skills'
import { portfolioRouter } from './routes/portfolio'
import { opportunitiesRouter } from './routes/opportunities'
import { settingsRouter } from './routes/settings'

const app = new Hono()

app.use('/*', cors())

app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.route('/api/profile', profileRouter)
app.route('/api/skills', skillsRouter)
app.route('/api/portfolio', portfolioRouter)
app.route('/api/opportunities', opportunitiesRouter)
app.route('/api/settings', settingsRouter)

export default app
export type AppType = typeof app
