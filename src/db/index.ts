import initSqlJs, { type Database } from 'sql.js'
import { drizzle, type SQLJsDatabase } from 'drizzle-orm/sql-js'
import * as schema from './schema'

let db: SQLJsDatabase<typeof schema> | null = null
let sqlDb: Database | null = null

const DB_STORAGE_KEY = '2blea-db-backup'

export async function initDatabase(): Promise<SQLJsDatabase<typeof schema>> {
  if (db) return db

  const SQL = await initSqlJs()

  const savedData = localStorage.getItem(DB_STORAGE_KEY)
  if (savedData) {
    try {
      const buffer = Uint8Array.from(atob(savedData), (c) => c.charCodeAt(0))
      sqlDb = new SQL.Database(buffer)
    } catch {
      sqlDb = new SQL.Database()
    }
  } else {
    sqlDb = new SQL.Database()
  }

  db = drizzle(sqlDb, { schema })
  createTables()
  seedInitialData()

  return db
}

function createTables() {
  if (!sqlDb) return

  sqlDb.run(`
    CREATE TABLE IF NOT EXISTS user_profile (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      brand TEXT NOT NULL DEFAULT '2bleA',
      description TEXT NOT NULL DEFAULT '',
      experience TEXT NOT NULL DEFAULT '',
      languages TEXT NOT NULL DEFAULT '[]',
      availability TEXT NOT NULL DEFAULT '',
      hours_per_week INTEGER NOT NULL DEFAULT 40,
      preferred_job_types TEXT NOT NULL DEFAULT '[]',
      avoided_job_types TEXT NOT NULL DEFAULT '[]',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `)

  sqlDb.run(`
    CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      level TEXT NOT NULL,
      category TEXT NOT NULL
    );
  `)

  sqlDb.run(`
    CREATE TABLE IF NOT EXISTS portfolio_projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      url TEXT,
      github TEXT,
      technologies TEXT NOT NULL DEFAULT '[]',
      category TEXT NOT NULL,
      image_url TEXT,
      relevance_level INTEGER NOT NULL DEFAULT 5,
      problem_solved TEXT NOT NULL DEFAULT '',
      date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'activo',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `)

  sqlDb.run(`
    CREATE TABLE IF NOT EXISTS job_opportunities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      url TEXT,
      platform TEXT NOT NULL,
      budget REAL,
      currency TEXT NOT NULL DEFAULT 'USD',
      client_name TEXT,
      requirements TEXT NOT NULL DEFAULT '[]',
      technologies TEXT NOT NULL DEFAULT '[]',
      estimated_hours INTEGER,
      duration TEXT,
      status TEXT NOT NULL DEFAULT 'nueva',
      compatibility_score REAL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `)

  sqlDb.run(`
    CREATE TABLE IF NOT EXISTS job_analyses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      opportunity_id INTEGER NOT NULL,
      what_client_needs TEXT NOT NULL DEFAULT '',
      required_technologies TEXT NOT NULL DEFAULT '[]',
      matching_skills TEXT NOT NULL DEFAULT '[]',
      missing_skills TEXT NOT NULL DEFAULT '[]',
      difficulty INTEGER NOT NULL DEFAULT 5,
      estimated_time TEXT NOT NULL DEFAULT '',
      recommended_portfolio_ids TEXT NOT NULL DEFAULT '[]',
      risks TEXT NOT NULL DEFAULT '',
      worth_applying INTEGER NOT NULL DEFAULT 1,
      suggested_min_price REAL,
      suggested_recommended_price REAL,
      suggested_max_price REAL,
      questions_for_client TEXT NOT NULL DEFAULT '[]',
      created_at INTEGER NOT NULL
    );
  `)

  sqlDb.run(`
    CREATE TABLE IF NOT EXISTS proposals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      opportunity_id INTEGER NOT NULL,
      short_version TEXT NOT NULL,
      full_version TEXT NOT NULL,
      language TEXT NOT NULL DEFAULT 'es',
      tone TEXT NOT NULL DEFAULT 'profesional',
      created_at INTEGER NOT NULL
    );
  `)

  sqlDb.run(`
    CREATE TABLE IF NOT EXISTS search_preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      keywords TEXT NOT NULL DEFAULT '[]',
      excluded_technologies TEXT NOT NULL DEFAULT '[]',
      min_budget REAL,
      max_budget REAL,
      currency TEXT NOT NULL DEFAULT 'USD',
      max_hours INTEGER,
      max_duration TEXT,
      experience_level TEXT,
      platforms TEXT NOT NULL DEFAULT '[]',
      language TEXT,
      project_type TEXT,
      remote_only INTEGER NOT NULL DEFAULT 1
    );
  `)

  sqlDb.run(`
    CREATE TABLE IF NOT EXISTS ai_configuration (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider TEXT NOT NULL DEFAULT 'openai',
      model TEXT NOT NULL DEFAULT 'gpt-4o',
      api_key_encrypted TEXT,
      temperature REAL NOT NULL DEFAULT 0.7,
      language TEXT NOT NULL DEFAULT 'es',
      max_tokens INTEGER NOT NULL DEFAULT 2048
    );
  `)

  sqlDb.run(`
    CREATE TABLE IF NOT EXISTS decisions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      opportunity_id INTEGER NOT NULL,
      decision TEXT NOT NULL,
      reason TEXT,
      created_at INTEGER NOT NULL
    );
  `)

  sqlDb.run(`
    CREATE TABLE IF NOT EXISTS scoring_weights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      technologies INTEGER NOT NULL DEFAULT 30,
      experience INTEGER NOT NULL DEFAULT 20,
      budget INTEGER NOT NULL DEFAULT 15,
      time INTEGER NOT NULL DEFAULT 10,
      difficulty INTEGER NOT NULL DEFAULT 10,
      portfolio INTEGER NOT NULL DEFAULT 10,
      language INTEGER NOT NULL DEFAULT 5
    );
  `)
}

function seedInitialData() {
  if (!sqlDb) return

  const profileCount = sqlDb.exec('SELECT COUNT(*) FROM user_profile')
  if (profileCount.length === 0 || (profileCount[0].values[0][0] as number) === 0) {
    sqlDb.run(
      `INSERT INTO user_profile (name, brand, description, experience, languages, availability, hours_per_week, preferred_job_types, avoided_job_types, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'Aaron',
        '2bleA',
        'Desarrollo de software y soluciones digitales',
        '',
        JSON.stringify(['Español', 'Inglés']),
        'Tiempo completo',
        40,
        JSON.stringify(['Frontend', 'Full Stack', 'SaaS']),
        JSON.stringify(['WordPress', 'PHP']),
        Date.now(),
        Date.now(),
      ]
    )
  }

  const skillsCount = sqlDb.exec('SELECT COUNT(*) FROM skills')
  if (skillsCount.length === 0 || (skillsCount[0].values[0][0] as number) === 0) {
    const defaultSkills: [string, string, string][] = [
      ['React', 'avanzado', 'Frontend'],
      ['Next.js', 'avanzado', 'Frontend'],
      ['TypeScript', 'avanzado', 'Frontend'],
      ['JavaScript', 'avanzado', 'Frontend'],
      ['HTML', 'avanzado', 'Frontend'],
      ['CSS', 'avanzado', 'Frontend'],
      ['Tailwind CSS', 'avanzado', 'Frontend'],
      ['Vite', 'intermedio', 'Frontend'],
      ['Node.js', 'avanzado', 'Backend'],
      ['APIs REST', 'avanzado', 'Backend'],
      ['PostgreSQL', 'intermedio', 'Backend'],
      ['Drizzle ORM', 'intermedio', 'Backend'],
      ['Prisma', 'intermedio', 'Backend'],
      ['Autenticación', 'intermedio', 'Backend'],
      ['React Native', 'intermedio', 'Mobile'],
      ['Expo', 'intermedio', 'Mobile'],
      ['Git', 'avanzado', 'DevOps'],
      ['GitHub', 'avanzado', 'DevOps'],
      ['Vercel', 'avanzado', 'DevOps'],
      ['Render', 'intermedio', 'DevOps'],
      ['Docker', 'intermedio', 'DevOps'],
      ['AWS', 'basico', 'DevOps'],
      ['Figma', 'intermedio', 'Diseño'],
      ['UI Design', 'intermedio', 'Diseño'],
      ['UX Design', 'intermedio', 'Diseño'],
      ['Python', 'intermedio', 'Otros'],
      ['Java', 'basico', 'Otros'],
      ['C#', 'basico', 'Otros'],
      ['OpenCode', 'intermedio', 'IA'],
      ['Cline', 'intermedio', 'IA'],
    ]

    const stmt = sqlDb.prepare(
      'INSERT INTO skills (name, level, category) VALUES (?, ?, ?)'
    )
    for (const skill of defaultSkills) {
      stmt.run(skill)
    }
    stmt.free()
  }

  const weightsCount = sqlDb.exec('SELECT COUNT(*) FROM scoring_weights')
  if (weightsCount.length === 0 || (weightsCount[0].values[0][0] as number) === 0) {
    sqlDb.run(
      `INSERT INTO scoring_weights (technologies, experience, budget, time, difficulty, portfolio, language)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [30, 20, 15, 10, 10, 10, 5]
    )
  }

  const prefsCount = sqlDb.exec('SELECT COUNT(*) FROM search_preferences')
  if (prefsCount.length === 0 || (prefsCount[0].values[0][0] as number) === 0) {
    sqlDb.run(
      `INSERT INTO search_preferences (keywords, excluded_technologies, currency, platforms, remote_only)
       VALUES (?, ?, ?, ?, ?)`,
      [
        JSON.stringify([
          'React',
          'Next.js',
          'TypeScript',
          'JavaScript',
          'Frontend',
          'Full Stack',
          'Web Development',
        ]),
        JSON.stringify(['PHP', 'Laravel', 'Angular', 'WordPress']),
        'USD',
        JSON.stringify(['Upwork', 'Workana', 'Contra', 'Fiverr']),
        1,
      ]
    )
  }

  const aiCount = sqlDb.exec('SELECT COUNT(*) FROM ai_configuration')
  if (aiCount.length === 0 || (aiCount[0].values[0][0] as number) === 0) {
    sqlDb.run(
      `INSERT INTO ai_configuration (provider, model, temperature, language, max_tokens)
       VALUES (?, ?, ?, ?, ?)`,
      ['openai', 'gpt-4o', 0.7, 'es', 2048]
    )
  }
}

export function saveDatabase(): void {
  if (!sqlDb) return
  const data = sqlDb.export()
  const base64 = btoa(String.fromCharCode(...data))
  localStorage.setItem(DB_STORAGE_KEY, base64)
}

export function exportBackup(): string {
  if (!sqlDb) throw new Error('Database not initialized')
  const data = sqlDb.export()
  return btoa(String.fromCharCode(...data))
}

export async function importBackup(base64Data: string): Promise<void> {
  const buffer = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0))
  const SQL = await initSqlJs()
  sqlDb = new SQL.Database(buffer)
  db = drizzle(sqlDb, { schema })
  saveDatabase()
}

export function getDb(): SQLJsDatabase<typeof schema> {
  if (!db) throw new Error('Database not initialized')
  return db
}
