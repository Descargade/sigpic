import { Hono } from 'hono'
import { getDb } from '../db'
import { searchPreferencesTable, scoringWeightsTable } from '../../db/schema.pg'
import { eq } from 'drizzle-orm'

export const settingsRouter = new Hono()

// GET /api/settings
settingsRouter.get('/', async (c) => {
  try {
    const db = getDb()
    const preferences = await db.select().from(searchPreferencesTable).limit(1)
    const weights = await db.select().from(scoringWeightsTable).limit(1)
    return c.json({
      success: true,
      data: {
        preferences: preferences[0] ?? null,
        weights: weights[0] ?? null,
      },
    })
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500)
  }
})

// PUT /api/settings/preferences
settingsRouter.put('/preferences', async (c) => {
  try {
    const body = await c.req.json()
    const db = getDb()

    const existing = await db.select().from(searchPreferencesTable).limit(1)
    if (existing.length > 0) {
      await db.update(searchPreferencesTable)
        .set(body)
        .where(eq(searchPreferencesTable.id, existing[0].id))
    } else {
      await db.insert(searchPreferencesTable).values(body)
    }

    const updated = await db.select().from(searchPreferencesTable).limit(1)
    return c.json({ success: true, data: updated[0] ?? null })
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500)
  }
})

// GET /api/backup/export
settingsRouter.get('/backup/export', async (c) => {
  try {
    const db = getDb()

    const profile = await db.select().from(searchPreferencesTable)
    const skills = await db.select().from(searchPreferencesTable)
    const portfolio = await db.select().from(searchPreferencesTable)
    const opportunities = await db.select().from(searchPreferencesTable)
    const preferences = await db.select().from(searchPreferencesTable).limit(1)
    const weights = await db.select().from(scoringWeightsTable).limit(1)

    const backup = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      data: { profile, skills, portfolio, opportunities, preferences, weights },
    }

    return c.json({ success: true, data: backup })
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500)
  }
})
