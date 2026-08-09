import { api } from './client'
import type { PortfolioProject } from '@/types'

export const portfolioApi = {
  getAll: () => api.get<PortfolioProject[]>('/portfolio'),
  create: (project: Omit<PortfolioProject, 'id' | 'createdAt' | 'updatedAt'>) => api.post<PortfolioProject>('/portfolio', project),
  update: (id: number, project: Partial<PortfolioProject>) => api.put<PortfolioProject>(`/portfolio/${id}`, project),
  delete: (id: number) => api.delete(`/portfolio/${id}`),
}
