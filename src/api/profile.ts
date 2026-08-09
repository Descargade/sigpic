import { api } from './client'
import type { UserProfile } from '@/types'

export const profileApi = {
  get: () => api.get<UserProfile | null>('/profile'),
  update: (profile: Partial<UserProfile>) => api.put<UserProfile>('/profile', profile),
}
