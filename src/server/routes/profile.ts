import { Hono } from 'hono'
import { getDb } from '../db.js'
import { userProfileTable } from '../../db/schema.pg.js'
import { eq } from 'drizzle-orm'
import { prepareForDb } from '../date-utils.js'

export const profileRouter = new Hono()

// GET /api/profile
profileRouter.get('/', async (c) => {
  try {
    const db = getDb()
    const profile = await db.select().from(userProfileTable).limit(1)
    return c.json({ success: true, data: profile[0] ?? null })
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500)
  }
})

// PUT /api/profile
profileRouter.put('/', async (c) => {
  try {
    const body = await c.req.json()
    const db = getDb()

    const existing = await db.select().from(userProfileTable).limit(1)

    if (existing.length > 0) {
      await db.update(userProfileTable)
        .set({ ...prepareForDb(userProfileTable, body), updatedAt: new Date() })
        .where(eq(userProfileTable.id, existing[0].id))
    } else {
      await db.insert(userProfileTable).values(prepareForDb(userProfileTable, body))
    }

    const updated = await db.select().from(userProfileTable).limit(1)
    return c.json({ success: true, data: updated[0] ?? null })
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500)
  }
})
