import { useEffect, useState } from 'react'
import { Trash2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getDb, saveDatabase } from '@/db'
import { userProfileTable, skillsTable } from '@/db/schema'
import { sql } from 'drizzle-orm'
import { mapUserProfile, mapSkill } from '@/db/mappers'
import type { SkillLevel, UserProfile, Skill } from '@/types'

const skillLevels: SkillLevel[] = ['basico', 'intermedio', 'avanzado']
const levelColors: Record<SkillLevel, 'default' | 'secondary' | 'accent'> = {
  basico: 'secondary',
  intermedio: 'accent',
  avanzado: 'default',
}

export function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [skills, setSkills] = useState<Skill[]>([])
  const [newSkill, setNewSkill] = useState({ name: '', level: 'intermedio' as SkillLevel, category: '' })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadProfile()
    loadSkills()
  }, [])

  function loadProfile() {
    const db = getDb()
    const result = db.select().from(userProfileTable).get()
    if (result) {
      setProfile(mapUserProfile(result))
    }
  }

  function loadSkills() {
    const db = getDb()
    const results = db.select().from(skillsTable).all()
    setSkills(results.map(mapSkill))
  }

  function saveProfile() {
    if (!profile) return
    const db = getDb()
    db.update(userProfileTable)
      .set({
        name: profile.name,
        brand: profile.brand,
        description: profile.description,
        experience: profile.experience,
        languages: JSON.stringify(profile.languages),
        availability: profile.availability,
        hoursPerWeek: profile.hoursPerWeek,
        preferredJobTypes: JSON.stringify(profile.preferredJobTypes),
        avoidedJobTypes: JSON.stringify(profile.avoidedJobTypes),
        updatedAt: new Date(),
      })
      .where(sql`id = 1`)
      .run()
    saveDatabase()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function addSkill() {
    if (!newSkill.name.trim() || !newSkill.category.trim()) return
    const db = getDb()
    db.insert(skillsTable).values({
      name: newSkill.name.trim(),
      level: newSkill.level,
      category: newSkill.category.trim(),
    }).run()
    saveDatabase()
    setNewSkill({ name: '', level: 'intermedio', category: '' })
    loadSkills()
  }

  function removeSkill(id: number) {
    const db = getDb()
    db.delete(skillsTable).where(sql`id = ${id}`).run()
    saveDatabase()
    loadSkills()
  }

  function updateSkillLevel(id: number, level: SkillLevel) {
    const db = getDb()
    db.update(skillsTable).set({ level }).where(sql`id = ${id}`).run()
    saveDatabase()
    loadSkills()
  }

  const groupedSkills = skills.reduce(
    (acc, skill) => {
      if (!acc[skill.category]) acc[skill.category] = []
      acc[skill.category].push(skill)
      return acc
    },
    {} as Record<string, Skill[]>
  )

  if (!profile) return null

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
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Tu nombre"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Marca</Label>
              <Input
                id="brand"
                value={profile.brand}
                onChange={(e) => setProfile({ ...profile, brand: e.target.value })}
                placeholder="Tu marca personal"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción profesional</Label>
            <Textarea
              id="description"
              value={profile.description}
              onChange={(e) => setProfile({ ...profile, description: e.target.value })}
              placeholder="Describe tu experiencia y especialidad..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Experiencia</Label>
            <Textarea
              id="experience"
              value={profile.experience}
              onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
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
                onChange={(e) => setProfile({ ...profile, languages: e.target.value.split(',').map((l) => l.trim()).filter(Boolean) })}
                placeholder="Español, Inglés"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="availability">Disponibilidad</Label>
              <Input
                id="availability"
                value={profile.availability}
                onChange={(e) => setProfile({ ...profile, availability: e.target.value })}
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
                onChange={(e) => setProfile({ ...profile, hoursPerWeek: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferredJobTypes">Tipos de trabajo preferidos</Label>
            <Input
              id="preferredJobTypes"
              value={profile.preferredJobTypes.join(', ')}
              onChange={(e) => setProfile({ ...profile, preferredJobTypes: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })}
              placeholder="Frontend, Full Stack, SaaS"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avoidedJobTypes">Tipos de trabajo a evitar</Label>
            <Input
              id="avoidedJobTypes"
              value={profile.avoidedJobTypes.join(', ')}
              onChange={(e) => setProfile({ ...profile, avoidedJobTypes: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })}
              placeholder="WordPress, PHP"
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={saveProfile}>
              <Save className="h-4 w-4" />
              {saved ? 'Guardado!' : 'Guardar perfil'}
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
            <Button onClick={addSkill}>
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
