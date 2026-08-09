import { useEffect, useState } from 'react'
import { Router, Route, Switch } from 'wouter'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/app-layout'
import { Dashboard } from '@/pages/dashboard'
import { Opportunities } from '@/pages/opportunities'
import { OpportunityDetail } from '@/pages/opportunity-detail'
import { Profile } from '@/pages/profile'
import { Portfolio } from '@/pages/portfolio'
import { SettingsPage } from '@/pages/settings'
import { initDatabase } from '@/db'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      gcTime: 1000 * 60 * 5,
    },
  },
})

function App() {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    initDatabase()
      .then(() => setReady(true))
      .catch((err) => setError(err.message))
  }, [])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-xl font-bold text-destructive">Error al iniciar</h1>
          <p className="mt-2 text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-muted-foreground">Cargando 2bleA Job Hunter...</p>
        </div>
      </div>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppLayout>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/oportunidades" component={Opportunities} />
            <Route path="/oportunidades/:id" component={OpportunityDetail} />
            <Route path="/perfil" component={Profile} />
            <Route path="/portfolio" component={Portfolio} />
            <Route path="/configuracion" component={SettingsPage} />
          </Switch>
        </AppLayout>
      </Router>
    </QueryClientProvider>
  )
}

export default App
