import { useEffect, useState } from 'react'
import { Trash2, Save, ExternalLink, Code2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getDb, saveDatabase } from '@/db'
import { portfolioProjectsTable } from '@/db/schema'
import { sql } from 'drizzle-orm'
import { mapPortfolioProject } from '@/db/mappers'
import type { PortfolioProject } from '@/types'

const categories = ['Web App', 'Mobile App', 'Dashboard', 'SaaS', 'Landing Page', 'E-commerce', 'Otro']
const statuses = ['activo', 'completado', 'pausado'] as const

export function Portfolio() {
  const [projects, setProjects] = useState<PortfolioProject[]>([])
  const [editing, setEditing] = useState<PortfolioProject | null>(null)
  const [form, setForm] = useState({
    name: '',
    description: '',
    url: '',
    github: '',
    technologies: '',
    category: 'Web App',
    imageUrl: '',
    relevanceLevel: 5,
    problemSolved: '',
    date: new Date().toISOString().split('T')[0],
    status: 'activo' as 'activo' | 'completado' | 'pausado',
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadProjects()
  }, [])

  function loadProjects() {
    const db = getDb()
    const results = db.select().from(portfolioProjectsTable).all()
    setProjects(results.map(mapPortfolioProject))
  }

  function resetForm() {
    setForm({
      name: '',
      description: '',
      url: '',
      github: '',
      technologies: '',
      category: 'Web App',
      imageUrl: '',
      relevanceLevel: 5,
      problemSolved: '',
      date: new Date().toISOString().split('T')[0],
      status: 'activo',
    })
    setEditing(null)
  }

  function editProject(project: PortfolioProject) {
    setEditing(project)
    setForm({
      name: project.name,
      description: project.description,
      url: project.url || '',
      github: project.github || '',
      technologies: project.technologies.join(', '),
      category: project.category,
      imageUrl: project.imageUrl || '',
      relevanceLevel: project.relevanceLevel,
      problemSolved: project.problemSolved,
      date: project.date,
      status: project.status,
    })
  }

  function saveProject() {
    if (!form.name.trim() || !form.description.trim()) return

    const db = getDb()
    const data = {
      name: form.name.trim(),
      description: form.description.trim(),
      url: form.url.trim() || null,
      github: form.github.trim() || null,
      technologies: JSON.stringify(form.technologies.split(',').map((t) => t.trim()).filter(Boolean)),
      category: form.category,
      imageUrl: form.imageUrl.trim() || null,
      relevanceLevel: form.relevanceLevel,
      problemSolved: form.problemSolved.trim(),
      date: form.date,
      status: form.status,
      updatedAt: new Date(),
    }

    if (editing) {
      db.update(portfolioProjectsTable).set(data).where(sql`id = ${editing.id}`).run()
    } else {
      db.insert(portfolioProjectsTable).values({ ...data, createdAt: new Date() }).run()
    }

    saveDatabase()
    resetForm()
    loadProjects()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function deleteProject(id: number) {
    const db = getDb()
    db.delete(portfolioProjectsTable).where(sql`id = ${id}`).run()
    saveDatabase()
    loadProjects()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
        <p className="text-muted-foreground">Gestiona tus proyectos para mostrar a clientes</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editing ? 'Editar Proyecto' : 'Agregar Proyecto'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nombre del proyecto"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <select
                id="category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción *</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe el proyecto..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="problemSolved">Problema que resuelve</Label>
            <Textarea
              id="problemSolved"
              value={form.problemSolved}
              onChange={(e) => setForm({ ...form, problemSolved: e.target.value })}
              placeholder="Qué problema resuelve este proyecto..."
              rows={2}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="url">URL del proyecto</Label>
              <Input
                id="url"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github">GitHub</Label>
              <Input
                id="github"
                value={form.github}
                onChange={(e) => setForm({ ...form, github: e.target.value })}
                placeholder="https://github.com/..."
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="technologies">Tecnologías (separadas por coma)</Label>
              <Input
                id="technologies"
                value={form.technologies}
                onChange={(e) => setForm({ ...form, technologies: e.target.value })}
                placeholder="React, Node.js, PostgreSQL"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <select
                id="status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as 'activo' | 'completado' | 'pausado' })}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="relevanceLevel">Nivel de relevancia (1-10)</Label>
              <Input
                id="relevanceLevel"
                type="number"
                min={1}
                max={10}
                value={form.relevanceLevel}
                onChange={(e) => setForm({ ...form, relevanceLevel: parseInt(e.target.value) || 5 })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            {editing && (
              <Button variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
            )}
            <Button onClick={saveProject} disabled={!form.name.trim() || !form.description.trim()}>
              <Save className="h-4 w-4" />
              {saved ? 'Guardado!' : editing ? 'Actualizar' : 'Agregar proyecto'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-base">{project.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col space-y-3">
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-1">
                {project.technologies.slice(0, 3).map((tech: string) => (
                  <Badge key={tech} variant="outline" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </div>
              <div className="mt-auto flex items-center justify-between pt-2">
                <div className="flex gap-1">
                  {project.url && (
                    <Button variant="ghost" size="icon" onClick={() => window.open(project.url!, '_blank')}>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                  {project.github && (
                    <Button variant="ghost" size="icon" onClick={() => window.open(project.github!, '_blank')}>
                      <Code2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => editProject(project)}>
                    <Save className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteProject(project.id)}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No hay proyectos aún</p>
            <p className="text-sm text-muted-foreground/70">Agrega tu primer proyecto arriba</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
