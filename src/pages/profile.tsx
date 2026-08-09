import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { profileApi } from '@/api/profile'
import { skillsApi } from '@/api/skills'
import type { SkillLevel, UserProfile, Skill } from '@/types'

const skillLevels: SkillLevel[] = ['basico', 'intermedio', 'avanzado']
const levelColors: Record<SkillLevel, 'default' | 'secondary' | 'accent'> = {
  basico: 'secondary',
  intermedio: 'accent',
  avanzado: 'default',
}

export function Profile() {
  const queryClient = useQueryClient()
  const [saved, setSaved] = useState(false)
  const [newSkill, setNewSkill] = useState({ name: '', level: 'intermedio' as SkillLevel, category: '' })

  // Queries
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: profileApi.get,
  })

  const { data: skills = [] } = useQuery({
    queryKey: ['skills'],
    queryFn: skillsApi.getAll,
  })

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<UserProfile>) => profileApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    },
  })

  const addSkillMutation = useMutation({
    mutationFn: (skill: Omit<Skill, 'id'>) => skillsApi.create(skill),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] })
      setNewSkill({ name: '', level: 'intermedio', category: '' })
    },
  })

  const updateSkillMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Skill> }) => skillsApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['skills'] }),
  })

  const deleteSkillMutation = useMutation({
    mutationFn: (id: number) => skillsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['skills'] }),
  })

  function saveProfile() {
    if (!profile) return
    updateProfileMutation.mutate(profile)
  }

  function addSkill() {
    if (!newSkill.name.trim() || !newSkill.category.trim()) return
    addSkillMutation.mutate({
      name: newSkill.name.trim(),
      level: newSkill.level,
      category: newSkill.category.trim(),
    })
  }

  function updateSkillLevel(id: number, level: SkillLevel) {
    updateSkillMutation.mutate({ id, data: { level } })
  }

  function removeSkill(id: number) {
    deleteSkillMutation.mutate(id)
  }

  const groupedSkills = skills.reduce(
    (acc, skill) => {
      if (!acc[skill.category]) acc[skill.category] = []
      acc[skill.category].push(skill)
      return acc
    },
    {} as Record<string, Skill[]>
  )

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">No se pudo cargar el perfil</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Perfil Profesional</h1>
        <p className="text-muted-foreground">Configura tu perfil para análisis de oportunidades</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => updateProfileMutation.mutate({ ...profile, name: e.target.value })}
                placeholder="Tu nombre"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Marca</Label>
              <Input
                id="brand"
                value={profile.brand}
                onChange={(e) => updateProfileMutation.mutate({ ...profile, brand: e.target.value })}
                placeholder="Tu marca personal"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción profesional</Label>
            <Textarea
              id="description"
              value={profile.description}
              onChange={(e) => updateProfileMutation.mutate({ ...profile, description: e.target.value })}
              placeholder="Describe tu experiencia y especialidad..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Experiencia</Label>
            <Textarea
              id="experience"
              value={profile.experience}
              onChange={(e) => updateProfileMutation.mutate({ ...profile, experience: e.target.value })}
              placeholder="Describe tu experiencia laboral..."
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="languages">Idiomas (separados por coma)</Label>
              <Input
                id="languages"
                value={profile.languages.join(', ')}
                onChange={(e) => updateProfileMutation.mutate({ ...profile, languages: e.target.value.split(',').map((l) => l.trim()).filter(Boolean) })}
                placeholder="Español, Inglés"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="availability">Disponibilidad</Label>
              <Input
                id="availability"
                value={profile.availability}
                onChange={(e) => updateProfileMutation.mutate({ ...profile, availability: e.target.value })}
                placeholder="Tiempo completo, Medio tiempo..."
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="hoursPerWeek">Horas semanales disponibles</Label>
              <Input
                id="hoursPerWeek"
                type="number"
                value={profile.hoursPerWeek}
                onChange={(e) => updateProfileMutation.mutate({ ...profile, hoursPerWeek: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferredJobTypes">Tipos de trabajo preferidos</Label>
            <Input
              id="preferredJobTypes"
              value={profile.preferredJobTypes.join(', ')}
              onChange={(e) => updateProfileMutation.mutate({ ...profile, preferredJobTypes: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })}
              placeholder="Frontend, Full Stack, SaaS"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avoidedJobTypes">Tipos de trabajo a evitar</Label>
            <Input
              id="avoidedJobTypes"
              value={profile.avoidedJobTypes.join(', ')}
              onChange={(e) => updateProfileMutation.mutate({ ...profile, avoidedJobTypes: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })}
              placeholder="WordPress, PHP"
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={saveProfile} disabled={updateProfileMutation.isPending}>
              <Save className="h-4 w-4" />
              {saved ? 'Guardado!' : updateProfileMutation.isPending ? 'Guardando...' : 'Guardar perfil'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Habilidades y Tecnologías</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2">
            <Input
              value={newSkill.name}
              onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
              placeholder="Nueva habilidad..."
              className="flex-1"
            />
            <select
              value={newSkill.level}
              onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value as SkillLevel })}
              className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
            >
              {skillLevels.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            <Input
              value={newSkill.category}
              onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
              placeholder="Categoría"
              className="w-32"
            />
            <Button onClick={addSkill} disabled={addSkillMutation.isPending}>
              Agregar
            </Button>
          </div>

          <div className="space-y-4">
            {Object.entries(groupedSkills).map(([category, categorySkills]) => (
              <div key={category}>
                <h4 className="mb-2 text-sm font-medium text-muted-foreground">{category}</h4>
                <div className="flex flex-wrap gap-2">
                  {categorySkills.map((skill) => (
                    <div key={skill.id} className="flex items-center gap-1">
                      <Badge variant={levelColors[skill.level]}>
                        {skill.name}
                      </Badge>
                      <select
                        value={skill.level}
                        onChange={(e) => updateSkillLevel(skill.id, e.target.value as SkillLevel)}
                        className="h-5 w-16 rounded border border-input bg-transparent text-xs"
                      >
                        {skillLevels.map((l) => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => removeSkill(skill.id)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
