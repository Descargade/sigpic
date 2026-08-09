import { Hono } from 'hono'
import { getDb } from '../db'
import { userProfileTable } from '../../db/schema.pg'
import { eq } from 'drizzle-orm'

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
        .set({ ...body, updatedAt: new Date() })
        .where(eq(userProfileTable.id, existing[0].id))
    } else {
      await db.insert(userProfileTable).values(body)
    }

    const updated = await db.select().from(userProfileTable).limit(1)
    return c.json({ success: true, data: updated[0] ?? null })
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500)
  }
})
