import { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import { Plus, Search, Star, StarOff, ExternalLink, Trash2, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { getDb, saveDatabase } from '@/db'
import { jobOpportunitiesTable } from '@/db/schema'
import { desc, sql } from 'drizzle-orm'
import { cn } from '@/lib/utils'
import { AddOpportunityModal } from '@/components/opportunities/add-opportunity-modal'
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

const statusColors: Record<OpportunityStatus, string> = {
  nueva: 'default',
  analizada: 'secondary',
  interesante: 'accent',
  favorita: 'warning',
  propuesta_generada: 'default',
  propuesta_enviada: 'accent',
  en_conversacion: 'default',
  ganada: 'success',
  perdida: 'destructive',
  descartada: 'secondary',
}

export function Opportunities() {
  const [, setLocation] = useLocation()
  const [opportunities, setOpportunities] = useState<JobOpportunity[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    loadOpportunities()
  }, [])

  function loadOpportunities() {
    const db = getDb()
    const results = db.select().from(jobOpportunitiesTable).orderBy(desc(jobOpportunitiesTable.createdAt)).all()
    setOpportunities(results.map(mapOpportunity))
  }

  function toggleFavorite(id: number, currentStatus: OpportunityStatus) {
    const db = getDb()
    const newStatus = currentStatus === 'favorita' ? 'nueva' : 'favorita'
    db.update(jobOpportunitiesTable).set({ status: newStatus }).where(sql`id = ${id}`).run()
    saveDatabase()
    loadOpportunities()
  }

  function discardOpportunity(id: number) {
    const db = getDb()
    db.update(jobOpportunitiesTable).set({ status: 'descartada' }).where(sql`id = ${id}`).run()
    saveDatabase()
    loadOpportunities()
  }

  const filtered = opportunities.filter((opp) => {
    const matchesSearch =
      opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.platform.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || opp.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Oportunidades</h1>
          <p className="text-muted-foreground">Gestiona tus oportunidades freelance</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4" />
          Agregar oportunidad
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar oportunidades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
        >
          <option value="all">Todos los estados</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-4">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">No hay oportunidades aún</p>
              <p className="text-sm text-muted-foreground/70">
                Agrega tu primera oportunidad manualmente
              </p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((opp) => (
            <Card
              key={opp.id}
              className={cn(
                'cursor-pointer transition-shadow hover:shadow-md',
                opp.status === 'descartada' && 'opacity-50'
              )}
              onClick={() => setLocation(`/oportunidades/${opp.id}`)}
            >
              <CardContent className="flex items-start justify-between p-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{opp.title}</h3>
                    {opp.compatibilityScore != null && (
                      <Badge variant={opp.compatibilityScore >= 75 ? 'success' : opp.compatibilityScore >= 50 ? 'warning' : 'destructive'}>
                        {opp.compatibilityScore}%
                      </Badge>
                    )}
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {opp.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{opp.platform}</Badge>
                    {opp.budget != null && (
                      <Badge variant="secondary">
                        {opp.currency} {opp.budget}
                      </Badge>
                    )}
                    <Badge variant={statusColors[opp.status] as 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'accent'}>
                      {statusLabels[opp.status]}
                    </Badge>
                    {opp.technologies.slice(0, 3).map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleFavorite(opp.id, opp.status)}
                  >
                    {opp.status === 'favorita' ? (
                      <Star className="h-4 w-4 fill-warning text-warning" />
                    ) : (
                      <StarOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                  {opp.url && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(opp.url!, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => discardOpportunity(opp.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {showAddModal && (
        <AddOpportunityModal
          onClose={() => setShowAddModal(false)}
          onSaved={() => {
            setShowAddModal(false)
            loadOpportunities()
          }}
        />
      )}
    </div>
  )
}
