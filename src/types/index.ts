export type SkillLevel = 'basico' | 'intermedio' | 'avanzado'

export interface UserProfile {
  id: number
  name: string
  brand: string
  description: string
  experience: string
  languages: string[]
  availability: string
  hoursPerWeek: number
  preferredJobTypes: string[]
  avoidedJobTypes: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Skill {
  id: number
  name: string
  level: SkillLevel
  category: string
}

export interface PortfolioProject {
  id: number
  name: string
  description: string
  url: string | null
  github: string | null
  technologies: string[]
  category: string
  imageUrl: string | null
  relevanceLevel: number
  problemSolved: string
  date: string
  status: 'activo' | 'completado' | 'pausado'
  createdAt: Date
  updatedAt: Date
}

export type OpportunityStatus =
  | 'nueva'
  | 'analizada'
  | 'interesante'
  | 'favorita'
  | 'propuesta_generada'
  | 'propuesta_enviada'
  | 'en_conversacion'
  | 'ganada'
  | 'perdida'
  | 'descartada'

export type Currency = 'USD' | 'EUR' | 'ARS' | 'MXN' | 'COP'

export interface JobOpportunity {
  id: number
  title: string
  description: string
  url: string | null
  platform: string
  budget: number | null
  currency: Currency
  clientName: string | null
  requirements: string[]
  technologies: string[]
  estimatedHours: number | null
  duration: string | null
  status: OpportunityStatus
  compatibilityScore: number | null
  createdAt: Date
  updatedAt: Date
}

export interface JobAnalysis {
  id: number
  opportunityId: number
  whatClientNeeds: string
  requiredTechnologies: string[]
  matchingSkills: string[]
  missingSkills: string[]
  difficulty: number
  estimatedTime: string
  recommendedPortfolioIds: number[]
  risks: string
  worthApplying: boolean
  suggestedMinPrice: number | null
  suggestedRecommendedPrice: number | null
  suggestedMaxPrice: number | null
  questionsForClient: string[]
  createdAt: Date
}

export interface Proposal {
  id: number
  opportunityId: number
  shortVersion: string
  fullVersion: string
  language: 'es' | 'en'
  tone: 'profesional' | 'directo' | 'amigable' | 'tecnico' | 'breve'
  createdAt: Date
}

export interface SearchPreferences {
  id: number
  keywords: string[]
  excludedTechnologies: string[]
  minBudget: number | null
  maxBudget: number | null
  currency: Currency
  maxHours: number | null
  maxDuration: string | null
  experienceLevel: string | null
  platforms: string[]
  language: string | null
  projectType: string | null
  remoteOnly: boolean
}

export interface AIConfiguration {
  id: number
  provider: 'openai' | 'anthropic' | 'ollama'
  model: string
  apiKeyEncrypted: string | null
  temperature: number
  language: 'es' | 'en'
  maxTokens: number
}

export interface Decision {
  id: number
  opportunityId: number
  decision: 'interesado' | 'no_interesado' | 'aplico' | 'no_aplico'
  reason: string | null
  createdAt: Date
}

export interface ScoringWeights {
  technologies: number
  experience: number
  budget: number
  time: number
  difficulty: number
  portfolio: number
  language: number
}
