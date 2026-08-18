import React, { useState } from 'react';
import { useListMovimientos, useListCatalogos, getListMovimientosQueryKey } from '@workspace/api-client-react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'wouter';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { History, Search, FilterX, ExternalLink, Building2, User, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function Movimientos() {
  const [tipo, setTipo] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tiposMovimiento } = useListCatalogos({ tipo: 'tipoMovimiento', soloActivos: true });
  const { data: movimientos, isLoading } = useListMovimientos({
    tipo: tipo !== 'todos' ? tipo : undefined
  });

  const deleteMovimiento = useMutation({
    mutationFn: async (id: number) => {
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${baseUrl}/api/movimientos/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      return res.json().catch(() => ({ success: true }));
    },
    onSuccess: () => {
      toast({ title: 'Movimiento eliminado' });
      queryClient.invalidateQueries({ queryKey: ['/api/movimientos'] });
    },
    onError: (err: any) => {
      toast({ variant: 'destructive', title: 'Error', description: err?.message || 'No se pudo eliminar el movimiento.' });
    },
  });

  const clearFilters = () => {
    setTipo('todos');
    setBusqueda('');
  };

  const filtered = movimientos?.filter(m => 
    !busqueda || 
    m.bienNombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    m.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ||
    m.dependenciaNombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    m.responsableNombre?.toLowerCase().includes(busqueda.toLowerCase())
  ) || [];

  const getMovimientoBadgeColor = (tipo: string) => {
    switch (tipo) {
      case 'Alta': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Baja': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'Cambio de estado': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Cambio de dependencia': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Cambio de responsable': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'Cambio de ubicación': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400';
      case 'Reparación': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Historial de Movimientos</h1>
        <p className="text-muted-foreground mt-1">Registro auditable de toda la actividad patrimonial.</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center">
            <Search className="w-5 h-5 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por bien, descripción, dependencia o responsable..."
                className="pl-9"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger className="w-full md:w-[250px]">
                <SelectValue placeholder="Tipo de movimiento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                {tiposMovimiento?.map(t => (
                  <SelectItem key={t.id} value={t.nombre}>{t.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={clearFilters}>
              <FilterX className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[160px]">Fecha</TableHead>
                <TableHead className="w-[140px]">Tipo</TableHead>
                <TableHead>Bien Afectado</TableHead>
                <TableHead>Detalle</TableHead>
                <TableHead className="w-[180px]">Dependencia</TableHead>
                <TableHead className="w-[160px]">Responsable</TableHead>
                <TableHead className="w-[100px]">Usuario</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-64" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-48 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <History className="h-10 w-10 mb-4 opacity-20" />
                      <p>No se encontraron registros de movimientos.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((mov) => (
                  <TableRow key={mov.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {format(new Date(mov.fecha), "dd/MM/yyyy HH:mm", { locale: es })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${getMovimientoBadgeColor(mov.tipo)}`}>
                        {mov.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/bienes/${mov.bienId}`} className="flex items-center hover:underline text-sm font-medium">
                        {mov.bienNombre}
                        <ExternalLink className="w-3 h-3 ml-1 text-muted-foreground" />
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm max-w-xs">
                        {mov.descripcion && <span className="block italic text-muted-foreground">"{mov.descripcion}"</span>}
                        
                        {(mov.estadoFisicoAnterior || mov.estadoFisicoNuevo) && (
                          <div className="text-xs mt-1">
                            <span className="text-muted-foreground mr-1">Estado Físico:</span>
                            {mov.estadoFisicoAnterior && <span className="line-through mr-1 opacity-70">{mov.estadoFisicoAnterior}</span>}
                            {mov.estadoFisicoAnterior && mov.estadoFisicoNuevo && <span>→</span>}
                            {mov.estadoFisicoNuevo && <span className="ml-1 font-medium">{mov.estadoFisicoNuevo}</span>}
                          </div>
                        )}
                        
                        {(mov.estadoAdministrativoAnterior || mov.estadoAdministrativoNuevo) && (
                          <div className="text-xs mt-1">
                            <span className="text-muted-foreground mr-1">Estado Admin:</span>
                            {mov.estadoAdministrativoAnterior && <span className="line-through mr-1 opacity-70">{mov.estadoAdministrativoAnterior}</span>}
                            {mov.estadoAdministrativoAnterior && mov.estadoAdministrativoNuevo && <span>→</span>}
                            {mov.estadoAdministrativoNuevo && <span className="ml-1 font-medium">{mov.estadoAdministrativoNuevo}</span>}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Building2 className="w-3 h-3 mr-1.5" />
                        {mov.dependenciaNombre || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="w-3 h-3 mr-1.5" />
                        {mov.responsableNombre || '-'}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {mov.usuario}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          if (window.confirm('¿Eliminar este movimiento? Esta acción no se puede deshacer.')) {
                            deleteMovimiento.mutate(mov.id);
                          }
                        }}
                        disabled={deleteMovimiento.isPending}
                        title="Eliminar movimiento"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
