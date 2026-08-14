import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import * as schema from '../db/schema.pg.js'

let db: NodePgDatabase<typeof schema> | null = null

export function getDb(): NodePgDatabase<typeof schema> {
  if (db) return db

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL no está configurada')
  }

  const pool = new pg.Pool({ connectionString })
  db = drizzle(pool, { schema })

  return db
}
