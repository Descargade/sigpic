import { api } from './client'
import type { JobOpportunity } from '@/types'

export const opportunitiesApi = {
  getAll: () => api.get<JobOpportunity[]>('/opportunities'),
  getById: (id: number) => api.get<JobOpportunity | null>(`/opportunities/${id}`),
  create: (opportunity: Omit<JobOpportunity, 'id' | 'createdAt' | 'updatedAt'>) => api.post<JobOpportunity>('/opportunities', opportunity),
  update: (id: number, opportunity: Partial<JobOpportunity>) => api.put<JobOpportunity>(`/opportunities/${id}`, opportunity),
  delete: (id: number) => api.delete(`/opportunities/${id}`),
}
