import { Hono } from 'hono'
import { getDb } from '../db'
import { skillsTable } from '../../db/schema.pg'
import { eq } from 'drizzle-orm'

export const skillsRouter = new Hono()

// GET /api/skills
skillsRouter.get('/', async (c) => {
  try {
    const db = getDb()
    const skills = await db.select().from(skillsTable)
    return c.json({ success: true, data: skills })
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500)
  }
})

// POST /api/skills
skillsRouter.post('/', async (c) => {
  try {
    const body = await c.req.json()
    const db = getDb()
    const result = await db.insert(skillsTable).values(body).returning()
    return c.json({ success: true, data: result[0] })
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500)
  }
})

// PUT /api/skills/:id
skillsRouter.put('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const body = await c.req.json()
    const db = getDb()
    const result = await db.update(skillsTable)
      .set(body)
      .where(eq(skillsTable.id, id))
      .returning()
    return c.json({ success: true, data: result[0] })
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500)
  }
})

// DELETE /api/skills/:id
skillsRouter.delete('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const db = getDb()
    await db.delete(skillsTable).where(eq(skillsTable.id, id))
    return c.json({ success: true })
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500)
  }
})
