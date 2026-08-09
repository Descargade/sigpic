import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { getDb, saveDatabase } from '@/db'
import { jobOpportunitiesTable } from '@/db/schema'
import type { Currency } from '@/types'

interface AddOpportunityModalProps {
  onClose: () => void
  onSaved: () => void
}

const platforms = ['Upwork', 'Workana', 'Contra', 'Fiverr', 'Freelancer', 'LinkedIn', 'Otro']
const currencies: Currency[] = ['USD', 'EUR', 'ARS', 'MXN', 'COP']

export function AddOpportunityModal({ onClose, onSaved }: AddOpportunityModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [platform, setPlatform] = useState('Upwork')
  const [budget, setBudget] = useState('')
  const [currency, setCurrency] = useState<Currency>('USD')
  const [clientName, setClientName] = useState('')
  const [requirements, setRequirements] = useState('')
  const [technologies, setTechnologies] = useState('')
  const [estimatedHours, setEstimatedHours] = useState('')
  const [duration, setDuration] = useState('')
  const [saving, setSaving] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !description.trim()) return

    setSaving(true)
    const db = getDb()

    db.insert(jobOpportunitiesTable).values({
      title: title.trim(),
      description: description.trim(),
      url: url.trim() || null,
      platform,
      budget: budget ? parseFloat(budget) : null,
      currency,
      clientName: clientName.trim() || null,
      requirements: JSON.stringify(requirements.split('\n').filter((r) => r.trim())),
      technologies: JSON.stringify(technologies.split(',').map((t) => t.trim()).filter(Boolean)),
      estimatedHours: estimatedHours ? parseInt(estimatedHours) : null,
      duration: duration.trim() || null,
      status: 'nueva',
      compatibilityScore: null,
    }).run()

    saveDatabase()
    setSaving(false)
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-background p-6 shadow-xl">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-bold">Agregar Oportunidad</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: React Developer for SaaS Dashboard"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Pega aquí la descripción completa de la oportunidad..."
                rows={5}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform">Plataforma</Label>
              <Select
                id="platform"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
              >
                {platforms.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">URL original</Label>
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Presupuesto</Label>
              <Input
                id="budget"
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="Ej: 500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Moneda</Label>
              <Select
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
              >
                {currencies.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientName">Cliente</Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Nombre del cliente"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedHours">Horas estimadas</Label>
              <Input
                id="estimatedHours"
                type="number"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                placeholder="Ej: 20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duración</Label>
              <Input
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Ej: 2 semanas"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="technologies">Tecnologías (separadas por coma)</Label>
              <Input
                id="technologies"
                value={technologies}
                onChange={(e) => setTechnologies(e.target.value)}
                placeholder="React, TypeScript, Node.js"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="requirements">Requisitos (uno por línea)</Label>
              <Textarea
                id="requirements"
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Experiencia con React&#10;Conocimiento de APIs REST&#10;Disponibilidad inmediata"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || !title.trim() || !description.trim()}>
              {saving ? 'Guardando...' : 'Guardar oportunidad'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
