import { useEffect } from 'react'
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
      retry: 1,
    },
  },
})

function App() {
  useEffect(() => {
    initDatabase().catch(console.error)
  }, [])

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
