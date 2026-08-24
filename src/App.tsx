import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter, Redirect } from 'wouter';
import { ThemeProvider } from '@/components/theme-provider';
import { setBaseUrl } from '@workspace/api-client-react';
import { AuthProvider, useAuth } from '@/contexts/auth-context';

// Configurar URL base del API
const apiUrl = import.meta.env.VITE_API_URL || '';
setBaseUrl(apiUrl);

// Layout
import { AppLayout } from '@/components/layout/app-layout';

// Pages
import Login from '@/pages/login';
import Dashboard from '@/pages/dashboard';
import BienesList from '@/pages/bienes/index';
import NuevoBien from '@/pages/bienes/nuevo';
import EditarBien from '@/pages/bienes/editar';
import DetalleBien from '@/pages/bienes/detalle';
import Dependencias from '@/pages/dependencias';
import Responsables from '@/pages/responsables';
import Movimientos from '@/pages/movimientos';
import Reportes from '@/pages/reportes';
import Configuracion from '@/pages/configuracion';
import Diagramas from '@/pages/diagramas';
import Documentos from '@/pages/documentos';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Redirect to="/login" />;
  return <AppLayout>{children}</AppLayout>;
}

function Router() {
  const { isAuthenticated } = useAuth();

  return (
    <Switch>
      <Route path="/login">
        {isAuthenticated ? <Redirect to="/" /> : <Login />}
      </Route>
      <Route path="/">
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      </Route>
      <Route path="/bienes">
        <ProtectedRoute><BienesList /></ProtectedRoute>
      </Route>
      <Route path="/bienes/nuevo">
        <ProtectedRoute><NuevoBien /></ProtectedRoute>
      </Route>
      <Route path="/bienes/:id/editar">
        <ProtectedRoute><EditarBien /></ProtectedRoute>
      </Route>
      <Route path="/bienes/:id">
        <ProtectedRoute><DetalleBien /></ProtectedRoute>
      </Route>
      <Route path="/dependencias">
        <ProtectedRoute><Dependencias /></ProtectedRoute>
      </Route>
      <Route path="/responsables">
        <ProtectedRoute><Responsables /></ProtectedRoute>
      </Route>
      <Route path="/movimientos">
        <ProtectedRoute><Movimientos /></ProtectedRoute>
      </Route>
      <Route path="/reportes">
        <ProtectedRoute><Reportes /></ProtectedRoute>
      </Route>
      <Route path="/documentos">
        <ProtectedRoute><Documentos /></ProtectedRoute>
      </Route>
      <Route path="/configuracion">
        <ProtectedRoute><Configuracion /></ProtectedRoute>
      </Route>
      <Route path="/diagramas">
        <ProtectedRoute><Diagramas /></ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="sigpic-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
              <Router />
            </WouterRouter>
            <Toaster />
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
