import { pgTable, serial, integer, text, real, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core'

export const userProfileTable = pgTable('user_profile', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  brand: text('brand').notNull().default('2bleA'),
  description: text('description').notNull().default(''),
  experience: text('experience').notNull().default(''),
  languages: jsonb('languages').notNull().$type<string[]>().default([]),
  availability: text('availability').notNull().default(''),
  hoursPerWeek: integer('hours_per_week').notNull().default(40),
  preferredJobTypes: jsonb('preferred_job_types').notNull().$type<string[]>().default([]),
  avoidedJobTypes: jsonb('avoided_job_types').notNull().$type<string[]>().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const skillsTable = pgTable('skills', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  level: text('level').notNull(),
  category: text('category').notNull(),
})

export const portfolioProjectsTable = pgTable('portfolio_projects', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  url: text('url'),
  github: text('github'),
  technologies: jsonb('technologies').notNull().$type<string[]>().default([]),
  category: text('category').notNull(),
  imageUrl: text('image_url'),
  relevanceLevel: integer('relevance_level').notNull().default(5),
  problemSolved: text('problem_solved').notNull().default(''),
  date: text('date').notNull(),
  status: text('status').notNull().default('activo'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const jobOpportunitiesTable = pgTable('job_opportunities', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  url: text('url'),
  platform: text('platform').notNull(),
  budget: real('budget'),
  currency: text('currency').notNull().default('USD'),
  clientName: text('client_name'),
  requirements: jsonb('requirements').notNull().$type<string[]>().default([]),
  technologies: jsonb('technologies').notNull().$type<string[]>().default([]),
  estimatedHours: integer('estimated_hours'),
  duration: text('duration'),
  status: text('status').notNull().default('nueva'),
  compatibilityScore: real('compatibility_score'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const jobAnalysesTable = pgTable('job_analyses', {
  id: serial('id').primaryKey(),
  opportunityId: integer('opportunity_id').notNull(),
  whatClientNeeds: text('what_client_needs').notNull().default(''),
  requiredTechnologies: jsonb('required_technologies').notNull().$type<string[]>().default([]),
  matchingSkills: jsonb('matching_skills').notNull().$type<string[]>().default([]),
  missingSkills: jsonb('missing_skills').notNull().$type<string[]>().default([]),
  difficulty: integer('difficulty').notNull().default(5),
  estimatedTime: text('estimated_time').notNull().default(''),
  recommendedPortfolioIds: jsonb('recommended_portfolio_ids').notNull().$type<number[]>().default([]),
  risks: text('risks').notNull().default(''),
  worthApplying: boolean('worth_applying').notNull().default(true),
  suggestedMinPrice: real('suggested_min_price'),
  suggestedRecommendedPrice: real('suggested_recommended_price'),
  suggestedMaxPrice: real('suggested_max_price'),
  questionsForClient: jsonb('questions_for_client').notNull().$type<string[]>().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const proposalsTable = pgTable('proposals', {
  id: serial('id').primaryKey(),
  opportunityId: integer('opportunity_id').notNull(),
  shortVersion: text('short_version').notNull(),
  fullVersion: text('full_version').notNull(),
  language: text('language').notNull().default('es'),
  tone: text('tone').notNull().default('profesional'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const searchPreferencesTable = pgTable('search_preferences', {
  id: serial('id').primaryKey(),
  keywords: jsonb('keywords').notNull().$type<string[]>().default([]),
  excludedTechnologies: jsonb('excluded_technologies').notNull().$type<string[]>().default([]),
  minBudget: real('min_budget'),
  maxBudget: real('max_budget'),
  currency: text('currency').notNull().default('USD'),
  maxHours: integer('max_hours'),
  maxDuration: text('max_duration'),
  experienceLevel: text('experience_level'),
  platforms: jsonb('platforms').notNull().$type<string[]>().default([]),
  language: text('language'),
  projectType: text('project_type'),
  remoteOnly: boolean('remote_only').notNull().default(true),
})

export const aiConfigurationTable = pgTable('ai_configuration', {
  id: serial('id').primaryKey(),
  provider: text('provider').notNull().default('openai'),
  model: text('model').notNull().default('gpt-4o'),
  apiKeyEncrypted: text('api_key_encrypted'),
  temperature: real('temperature').notNull().default(0.7),
  language: text('language').notNull().default('es'),
  maxTokens: integer('max_tokens').notNull().default(2048),
})

export const decisionsTable = pgTable('decisions', {
  id: serial('id').primaryKey(),
  opportunityId: integer('opportunity_id').notNull(),
  decision: text('decision').notNull(),
  reason: text('reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const scoringWeightsTable = pgTable('scoring_weights', {
  id: serial('id').primaryKey(),
  technologies: integer('technologies').notNull().default(30),
  experience: integer('experience').notNull().default(20),
  budget: integer('budget').notNull().default(15),
  time: integer('time').notNull().default(10),
  difficulty: integer('difficulty').notNull().default(10),
  portfolio: integer('portfolio').notNull().default(10),
  language: integer('language').notNull().default(5),
})
