import { useEffect, useState } from 'react'
import { Briefcase, Star, FileText, Trophy, TrendingUp, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getDb } from '@/db'
import { jobOpportunitiesTable } from '@/db/schema'
import { sql } from 'drizzle-orm'

interface DashboardStats {
  totalOpportunities: number
  newOpportunities: number
  excellentOpportunities: number
  proposalsGenerated: number
  proposalsSent: number
  wonProjects: number
  lostProjects: number
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOpportunities: 0,
    newOpportunities: 0,
    excellentOpportunities: 0,
    proposalsGenerated: 0,
    proposalsSent: 0,
    wonProjects: 0,
    lostProjects: 0,
  })

  useEffect(() => {
    loadStats()
  }, [])

  function loadStats() {
    try {
      const db = getDb()

      const total = db.select({ count: sql<number>`count(*)` }).from(jobOpportunitiesTable).get()
      const newOps = db.select({ count: sql<number>`count(*)` }).from(jobOpportunitiesTable).where(sql`status = 'nueva'`).get()
      const excellent = db.select({ count: sql<number>`count(*)` }).from(jobOpportunitiesTable).where(sql`compatibility_score >= 90`).get()
      const proposals = db.select({ count: sql<number>`count(*)` }).from(jobOpportunitiesTable).where(sql`status IN ('propuesta_generada', 'propuesta_enviada')`).get()
      const sent = db.select({ count: sql<number>`count(*)` }).from(jobOpportunitiesTable).where(sql`status = 'propuesta_enviada'`).get()
      const won = db.select({ count: sql<number>`count(*)` }).from(jobOpportunitiesTable).where(sql`status = 'ganada'`).get()
      const lost = db.select({ count: sql<number>`count(*)` }).from(jobOpportunitiesTable).where(sql`status = 'perdida'`).get()

      setStats({
        totalOpportunities: total?.count ?? 0,
        newOpportunities: newOps?.count ?? 0,
        excellentOpportunities: excellent?.count ?? 0,
        proposalsGenerated: proposals?.count ?? 0,
        proposalsSent: sent?.count ?? 0,
        wonProjects: won?.count ?? 0,
        lostProjects: lost?.count ?? 0,
      })
    } catch {
      // Database not ready yet, use default zeros
    }
  }

  const statCards = [
    { label: 'Oportunidades', value: stats.totalOpportunities, icon: Briefcase, color: 'text-primary' },
    { label: 'Nuevas', value: stats.newOpportunities, icon: Star, color: 'text-accent' },
    { label: 'Excelentes (90+)', value: stats.excellentOpportunities, icon: TrendingUp, color: 'text-success' },
    { label: 'Propuestas', value: stats.proposalsGenerated, icon: FileText, color: 'text-warning' },
    { label: 'Ganados', value: stats.wonProjects, icon: Trophy, color: 'text-success' },
    { label: 'Enviadas', value: stats.proposalsSent, icon: Clock, color: 'text-muted-foreground' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Resumen de tu actividad freelance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estado del Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="h-2 w-2 rounded-full bg-success" />
            <span>Base de datos SQLite activa</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="h-2 w-2 rounded-full bg-success" />
            <span>Persistencia local habilitada</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="h-2 w-2 rounded-full bg-warning" />
            <span>Integraciones IA: Pendiente (Fase 2)</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="h-2 w-2 rounded-full bg-muted" />
            <span>Conexión con plataformas: Pendiente (Fase 4)</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
