import { Hono } from 'hono'
import { getDb } from '../db.js'
import { portfolioProjectsTable } from '../../db/schema.pg.js'
import { eq } from 'drizzle-orm'
import { prepareForDb } from '../date-utils.js'

export const portfolioRouter = new Hono()

// GET /api/portfolio
portfolioRouter.get('/', async (c) => {
  try {
    const db = getDb()
    const projects = await db.select().from(portfolioProjectsTable)
    return c.json({ success: true, data: projects })
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500)
  }
})

// POST /api/portfolio
portfolioRouter.post('/', async (c) => {
  try {
    const body = await c.req.json()
    const db = getDb()
    const result = await db.insert(portfolioProjectsTable).values(prepareForDb(portfolioProjectsTable, body)).returning()
    return c.json({ success: true, data: result[0] })
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500)
  }
})

// PUT /api/portfolio/:id
portfolioRouter.put('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const body = await c.req.json()
    const db = getDb()
    const result = await db.update(portfolioProjectsTable)
      .set({ ...prepareForDb(portfolioProjectsTable, body), updatedAt: new Date() })
      .where(eq(portfolioProjectsTable.id, id))
      .returning()
    return c.json({ success: true, data: result[0] })
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500)
  }
})

// DELETE /api/portfolio/:id
portfolioRouter.delete('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const db = getDb()
    await db.delete(portfolioProjectsTable).where(eq(portfolioProjectsTable.id, id))
    return c.json({ success: true })
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500)
  }
})
