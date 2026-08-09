import {
  jobOpportunitiesTable,
  portfolioProjectsTable,
  userProfileTable,
  skillsTable,
  parseJsonArray,
} from './schema'
import type { JobOpportunity, PortfolioProject, UserProfile, Skill } from '@/types'

export function mapOpportunity(row: typeof jobOpportunitiesTable.$inferSelect): JobOpportunity {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    url: row.url,
    platform: row.platform,
    budget: row.budget,
    currency: row.currency as JobOpportunity['currency'],
    clientName: row.clientName,
    requirements: parseJsonArray(row.requirements),
    technologies: parseJsonArray(row.technologies),
    estimatedHours: row.estimatedHours,
    duration: row.duration,
    status: row.status as JobOpportunity['status'],
    compatibilityScore: row.compatibilityScore,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export function mapPortfolioProject(row: typeof portfolioProjectsTable.$inferSelect): PortfolioProject {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    url: row.url,
    github: row.github,
    technologies: parseJsonArray(row.technologies),
    category: row.category,
    imageUrl: row.imageUrl,
    relevanceLevel: row.relevanceLevel,
    problemSolved: row.problemSolved,
    date: row.date,
    status: row.status as PortfolioProject['status'],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export function mapUserProfile(row: typeof userProfileTable.$inferSelect): UserProfile {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    description: row.description,
    experience: row.experience,
    languages: parseJsonArray(row.languages),
    availability: row.availability,
    hoursPerWeek: row.hoursPerWeek,
    preferredJobTypes: parseJsonArray(row.preferredJobTypes),
    avoidedJobTypes: parseJsonArray(row.avoidedJobTypes),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export function mapSkill(row: typeof skillsTable.$inferSelect): Skill {
  return {
    id: row.id,
    name: row.name,
    level: row.level as Skill['level'],
    category: row.category,
  }
}
