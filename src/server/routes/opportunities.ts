import { Hono } from 'hono'
import { getDb } from '../db'
import { jobOpportunitiesTable } from '../../db/schema.pg'
import { eq, desc } from 'drizzle-orm'

export const opportunitiesRouter = new Hono()

// GET /api/opportunities
opportunitiesRouter.get('/', async (c) => {
  try {
    const db = getDb()
    const opportunities = await db.select().from(jobOpportunitiesTable).orderBy(desc(jobOpportunitiesTable.createdAt))
    return c.json({ success: true, data: opportunities })
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500)
  }
})

// GET /api/opportunities/:id
opportunitiesRouter.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const db = getDb()
    const opportunity = await db.select().from(jobOpportunitiesTable).where(eq(jobOpportunitiesTable.id, id))
    return c.json({ success: true, data: opportunity[0] ?? null })
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500)
  }
})

// POST /api/opportunities
opportunitiesRouter.post('/', async (c) => {
  try {
    const body = await c.req.json()
    const db = getDb()
    const result = await db.insert(jobOpportunitiesTable).values(body).returning()
    return c.json({ success: true, data: result[0] })
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500)
  }
})

// PUT /api/opportunities/:id
opportunitiesRouter.put('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const body = await c.req.json()
    const db = getDb()
    const result = await db.update(jobOpportunitiesTable)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(jobOpportunitiesTable.id, id))
      .returning()
    return c.json({ success: true, data: result[0] })
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500)
  }
})

// DELETE /api/opportunities/:id
opportunitiesRouter.delete('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const db = getDb()
    await db.delete(jobOpportunitiesTable).where(eq(jobOpportunitiesTable.id, id))
    return c.json({ success: true })
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500)
  }
})
