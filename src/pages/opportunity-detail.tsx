import { useEffect, useState } from 'react'
import { useParams, useLocation } from 'wouter'
import {
  ArrowLeft,
  ExternalLink,
  Star,
  StarOff,
  Clock,
  DollarSign,
  Tag,
  Building2,
  AlertCircle,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getDb, saveDatabase } from '@/db'
import { jobOpportunitiesTable } from '@/db/schema'
import { sql } from 'drizzle-orm'
import { formatCurrency } from '@/lib/utils'
import { mapOpportunity } from '@/db/mappers'
import type { OpportunityStatus, JobOpportunity } from '@/types'

const statusLabels: Record<OpportunityStatus, string> = {
  nueva: 'Nueva',
  analizada: 'Analizada',
  interesante: 'Interesante',
  favorita: 'Favorita',
  propuesta_generada: 'Propuesta generada',
  propuesta_enviada: 'Propuesta enviada',
  en_conversacion: 'En conversación',
  ganada: 'Ganada',
  perdida: 'Perdida',
  descartada: 'Descartada',
}

const statusOptions: OpportunityStatus[] = [
  'nueva',
  'analizada',
  'interesante',
  'favorita',
  'propuesta_generada',
  'propuesta_enviada',
  'en_conversacion',
  'ganada',
  'perdida',
  'descartada',
]

export function OpportunityDetail() {
  const { id } = useParams<{ id: string }>()
  const [, setLocation] = useLocation()
  const [opportunity, setOpportunity] = useState<JobOpportunity | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    if (id) {
      loadOpportunity(parseInt(id))
    }
  }, [id])

  function loadOpportunity(oppId: number) {
    const db = getDb()
    const result = db.select().from(jobOpportunitiesTable).where(sql`id = ${oppId}`).get()
    if (result) {
      const mapped = mapOpportunity(result)
      setOpportunity(mapped)
      setIsFavorite(mapped.status === 'favorita')
    }
  }

  function updateStatus(newStatus: OpportunityStatus) {
    if (!opportunity) return
    const db = getDb()
    db.update(jobOpportunitiesTable)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(sql`id = ${opportunity.id}`)
      .run()
    saveDatabase()
    loadOpportunity(opportunity.id)
  }

  function toggleFavorite() {
    if (!opportunity) return
    const newStatus = isFavorite ? 'interesante' : 'favorita'
    updateStatus(newStatus)
    setIsFavorite(!isFavorite)
  }

  if (!opportunity) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">Oportunidad no encontrada</p>
        <Button variant="link" onClick={() => setLocation('/oportunidades')}>
          Volver a oportunidades
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => setLocation('/oportunidades')}>
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Button>

      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{opportunity.title}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-sm">{opportunity.platform}</Badge>
            {opportunity.budget != null && (
              <Badge variant="secondary" className="text-sm">
                <DollarSign className="mr-1 h-3 w-3" />
                {formatCurrency(opportunity.budget, opportunity.currency)}
              </Badge>
            )}
            <Badge variant={opportunity.compatibilityScore != null && opportunity.compatibilityScore >= 75 ? 'success' : 'default'}>
              {opportunity.compatibilityScore != null ? `${opportunity.compatibilityScore}% compatibilidad` : 'Sin analizar'}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={toggleFavorite}>
            {isFavorite ? (
              <Star className="h-4 w-4 fill-warning text-warning" />
            ) : (
              <StarOff className="h-4 w-4" />
            )}
          </Button>
          {opportunity.url && (
            <Button variant="outline" onClick={() => window.open(opportunity.url!, '_blank')}>
              <ExternalLink className="h-4 w-4" />
              Abrir
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Descripción</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {opportunity.description}
              </p>
            </CardContent>
          </Card>

          {opportunity.requirements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Requisitos</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  {opportunity.requirements.map((req: string, i: number) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {opportunity.technologies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tecnologías</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {opportunity.technologies.map((tech: string) => (
                    <Badge key={tech} variant="accent">{tech}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-dashed border-primary/50 bg-primary/5">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <Sparkles className="h-10 w-10 text-primary/50" />
              <h3 className="mt-4 font-semibold">Análisis IA</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                El análisis inteligente estará disponible en la Fase 2.
                Podrás generar propuestas personalizadas y obtener recomendaciones de precio.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {opportunity.clientName && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Cliente:</span>
                  <span className="font-medium">{opportunity.clientName}</span>
                </div>
              )}
              {opportunity.estimatedHours != null && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Horas estimadas:</span>
                  <span className="font-medium">{opportunity.estimatedHours}h</span>
                </div>
              )}
              {opportunity.duration && (
                <div className="flex items-center gap-2 text-sm">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Duración:</span>
                  <span className="font-medium">{opportunity.duration}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Estado:</span>
                <select
                  value={opportunity.status}
                  onChange={(e) => updateStatus(e.target.value as OpportunityStatus)}
                  className="flex h-7 rounded border border-input bg-transparent px-2 text-sm"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>{statusLabels[s]}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full" disabled>
                <Sparkles className="h-4 w-4" />
                Generar propuesta (Fase 2)
              </Button>
              {opportunity.url && (
                <Button className="w-full" onClick={() => window.open(opportunity.url!, '_blank')}>
                  <ExternalLink className="h-4 w-4" />
                  Abrir en plataforma
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
