import { api } from './client'
import type { Skill } from '@/types'

export const skillsApi = {
  getAll: () => api.get<Skill[]>('/skills'),
  create: (skill: Omit<Skill, 'id'>) => api.post<Skill>('/skills', skill),
  update: (id: number, skill: Partial<Skill>) => api.put<Skill>(`/skills/${id}`, skill),
  delete: (id: number) => api.delete(`/skills/${id}`),
}
