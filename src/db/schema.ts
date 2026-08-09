import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core'

export const userProfileTable = sqliteTable('user_profile', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  brand: text('brand').notNull().default('2bleA'),
  description: text('description').notNull().default(''),
  experience: text('experience').notNull().default(''),
  languages: text('languages').notNull().default('[]'),
  availability: text('availability').notNull().default(''),
  hoursPerWeek: integer('hours_per_week').notNull().default(40),
  preferredJobTypes: text('preferred_job_types').notNull().default('[]'),
  avoidedJobTypes: text('avoided_job_types').notNull().default('[]'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const skillsTable = sqliteTable('skills', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  level: text('level').notNull(),
  category: text('category').notNull(),
})

export const portfolioProjectsTable = sqliteTable('portfolio_projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description').notNull(),
  url: text('url'),
  github: text('github'),
  technologies: text('technologies').notNull().default('[]'),
  category: text('category').notNull(),
  imageUrl: text('image_url'),
  relevanceLevel: integer('relevance_level').notNull().default(5),
  problemSolved: text('problem_solved').notNull().default(''),
  date: text('date').notNull(),
  status: text('status').notNull().default('activo'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const jobOpportunitiesTable = sqliteTable('job_opportunities', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  url: text('url'),
  platform: text('platform').notNull(),
  budget: real('budget'),
  currency: text('currency').notNull().default('USD'),
  clientName: text('client_name'),
  requirements: text('requirements').notNull().default('[]'),
  technologies: text('technologies').notNull().default('[]'),
  estimatedHours: integer('estimated_hours'),
  duration: text('duration'),
  status: text('status').notNull().default('nueva'),
  compatibilityScore: real('compatibility_score'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const jobAnalysesTable = sqliteTable('job_analyses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  opportunityId: integer('opportunity_id').notNull(),
  whatClientNeeds: text('what_client_needs').notNull().default(''),
  requiredTechnologies: text('required_technologies').notNull().default('[]'),
  matchingSkills: text('matching_skills').notNull().default('[]'),
  missingSkills: text('missing_skills').notNull().default('[]'),
  difficulty: integer('difficulty').notNull().default(5),
  estimatedTime: text('estimated_time').notNull().default(''),
  recommendedPortfolioIds: text('recommended_portfolio_ids').notNull().default('[]'),
  risks: text('risks').notNull().default(''),
  worthApplying: integer('worth_applying', { mode: 'boolean' }).notNull().default(true),
  suggestedMinPrice: real('suggested_min_price'),
  suggestedRecommendedPrice: real('suggested_recommended_price'),
  suggestedMaxPrice: real('suggested_max_price'),
  questionsForClient: text('questions_for_client').notNull().default('[]'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const proposalsTable = sqliteTable('proposals', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  opportunityId: integer('opportunity_id').notNull(),
  shortVersion: text('short_version').notNull(),
  fullVersion: text('full_version').notNull(),
  language: text('language').notNull().default('es'),
  tone: text('tone').notNull().default('profesional'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const searchPreferencesTable = sqliteTable('search_preferences', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  keywords: text('keywords').notNull().default('[]'),
  excludedTechnologies: text('excluded_technologies').notNull().default('[]'),
  minBudget: real('min_budget'),
  maxBudget: real('max_budget'),
  currency: text('currency').notNull().default('USD'),
  maxHours: integer('max_hours'),
  maxDuration: text('max_duration'),
  experienceLevel: text('experience_level'),
  platforms: text('platforms').notNull().default('[]'),
  language: text('language'),
  projectType: text('project_type'),
  remoteOnly: integer('remote_only', { mode: 'boolean' }).notNull().default(true),
})

export const aiConfigurationTable = sqliteTable('ai_configuration', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  provider: text('provider').notNull().default('openai'),
  model: text('model').notNull().default('gpt-4o'),
  apiKeyEncrypted: text('api_key_encrypted'),
  temperature: real('temperature').notNull().default(0.7),
  language: text('language').notNull().default('es'),
  maxTokens: integer('max_tokens').notNull().default(2048),
})

export const decisionsTable = sqliteTable('decisions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  opportunityId: integer('opportunity_id').notNull(),
  decision: text('decision').notNull(),
  reason: text('reason'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const scoringWeightsTable = sqliteTable('scoring_weights', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  technologies: integer('technologies').notNull().default(30),
  experience: integer('experience').notNull().default(20),
  budget: integer('budget').notNull().default(15),
  time: integer('time').notNull().default(10),
  difficulty: integer('difficulty').notNull().default(10),
  portfolio: integer('portfolio').notNull().default(10),
  language: integer('language').notNull().default(5),
})

// Type helpers for JSON columns
export function parseJsonArray(value: string | null): string[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function stringifyArray(value: string[]): string {
  return JSON.stringify(value)
}
