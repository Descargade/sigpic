import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useListBienes, getListBienesQueryKey, useListCategorias, useListDependencias } from '@workspace/api-client-react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EstadoFisicoBadge, EstadoAdminBadge } from '@/components/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus, FilterX, Server, Eye, Copy, Package, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function BienesList() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Filters state
  const [busqueda, setBusqueda] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | undefined>();
  const [dependenciaId, setDependenciaId] = useState<number | undefined>();
  const [estadoFisico, setEstadoFisico] = useState<string>('todos');
  const [estadoAdmin, setEstadoAdmin] = useState<string>('todos');

  // Fetch filter options
  const { data: categorias } = useListCategorias();
  const { data: dependencias } = useListDependencias();

  // Fetch list
  const { data: bienes, isLoading } = useListBienes({
    busqueda: busqueda || undefined,
    categoriaId,
    dependenciaId,
    estadoFisico: estadoFisico !== 'todos' ? estadoFisico : undefined,
    estadoAdministrativo: estadoAdmin !== 'todos' ? estadoAdmin : undefined,
  });

  const duplicateBien = useMutation({
    mutationFn: (bienId: number) => fetch(`${import.meta.env.VITE_API_URL || ''}/api/bienes/${bienId}/duplicar`, { method: 'POST' }).then(r => r.json()),
    onSuccess: (data) => {
      toast({ title: "Bien duplicado", description: `Se creó una copia (${data.codigoInterno}).` });
      queryClient.invalidateQueries({ queryKey: ['/api/bienes'] });
      setLocation(`/bienes/${data.id}`);
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "No se pudo duplicar el bien." });
    },
  });

  const clearFilters = () => {
    setBusqueda('');
    setCategoriaId(undefined);
    setDependenciaId(undefined);
    setEstadoFisico('todos');
    setEstadoAdmin('todos');
  };

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            Bienes Patrimoniales
            {bienes && (
              <Badge variant="secondary" className="text-sm font-normal">
                {bienes.length} registros
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">Gestión del inventario de informática y comunicaciones.</p>
        </div>
        <Link href="/bienes/nuevo">
          <Button className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            Nuevo Bien
          </Button>
        </Link>
      </div>

      {/* ─── RESUMEN RÁPIDO ───────────────────────────────────────────────── */}
      {bienes && bienes.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200/50">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-emerald-700">{bienes.filter(b => b.estadoAdministrativo === 'Activo' || b.estadoAdministrativo === 'Asignado').length}</div>
              <div className="text-xs text-emerald-600">En uso</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200/50">
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-amber-700">{bienes.filter(b => b.estadoAdministrativo === 'En reparacion' || b.estadoAdministrativo === 'Deposito').length}</div>
              <div className="text-xs text-amber-600">Reparación/Depósito</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-200/50">
            <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-red-700">{bienes.filter(b => b.estadoAdministrativo === 'Faltante' || b.estadoAdministrativo === 'Baja').length}</div>
              <div className="text-xs text-red-600">Extraviados/Baja</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200/50">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-blue-700">{bienes.filter(b => (b.cantidadComponentes || 0) > 0).length}</div>
              <div className="text-xs text-blue-600">Con componentes</div>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative col-span-1 lg:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por código, serie, nombre o marca..."
                className="pl-9"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            
            <Select value={categoriaId?.toString() || 'todas'} onValueChange={(v) => setCategoriaId(v === 'todas' ? undefined : parseInt(v))}>
              <SelectTrigger>
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las categorías</SelectItem>
                {categorias?.map(c => (
                  <SelectItem key={c.id} value={c.id.toString()}>{c.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dependenciaId?.toString() || 'todas'} onValueChange={(v) => setDependenciaId(v === 'todas' ? undefined : parseInt(v))}>
              <SelectTrigger>
                <SelectValue placeholder="Dependencia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las dependencias</SelectItem>
                {dependencias?.map(d => (
                  <SelectItem key={d.id} value={d.id.toString()}>{d.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Select value={estadoAdmin} onValueChange={setEstadoAdmin}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Estado Admin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="En uso">En uso</SelectItem>
                  <SelectItem value="En depósito">En depósito</SelectItem>
                  <SelectItem value="En reparación">En reparación</SelectItem>
                  <SelectItem value="Prestado">Prestado</SelectItem>
                  <SelectItem value="Extraviado">Extraviado</SelectItem>
                  <SelectItem value="De baja">De baja</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={clearFilters} title="Limpiar filtros">
                <FilterX className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Código</TableHead>
                <TableHead>Identificación</TableHead>
                <TableHead>Nombre del Bien</TableHead>
                <TableHead>Categoría / Ubicación</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : bienes?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Server className="h-8 w-8 opacity-40" />
                      </div>
                      <p className="font-medium text-lg mb-1">No se encontraron bienes</p>
                      <p className="text-sm mb-4">
                        {busqueda || categoriaId || dependenciaId || estadoFisico !== 'todos' || estadoAdmin !== 'todos'
                          ? 'No hay resultados para los filtros seleccionados.'
                          : 'Comience agregando el primer bien patrimonial al inventario.'}
                      </p>
                      <div className="flex gap-2">
                        {(busqueda || categoriaId || dependenciaId || estadoFisico !== 'todos' || estadoAdmin !== 'todos') ? (
                          <Button variant="outline" onClick={clearFilters}>
                            <FilterX className="w-4 h-4 mr-2" />
                            Limpiar filtros
                          </Button>
                        ) : (
                          <Link href="/bienes/nuevo">
                            <Button>
                              <Plus className="w-4 h-4 mr-2" />
                              Agregar primer bien
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                bienes?.map((bien) => (
                  <TableRow key={bien.id} className="hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => setLocation(`/bienes/${bien.id}`)}>
                    <TableCell className="font-mono text-xs">{bien.codigoInterno || '-'}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{bien.numeroPatrimonial || 'Sin Nº Patrimonial'}</span>
                        {bien.numeroSerie && <span className="text-xs text-muted-foreground font-mono">S/N: {bien.numeroSerie}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{bien.nombre}</span>
                        {(bien.marca || bien.modelo) && (
                          <span className="text-xs text-muted-foreground mt-1">
                            {bien.marca} {bien.modelo}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <span className="text-sm">{bien.categoriaNombre || '-'}</span>
                        <span className="text-xs text-muted-foreground flex items-center">
                          {bien.dependenciaNombre || 'Sin asignar'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5 items-start">
                        <EstadoAdminBadge status={bien.estadoAdministrativo} />
                        <EstadoFisicoBadge status={bien.estadoFisico} className="text-[10px] h-5 px-1.5" />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); duplicateBien.mutate(bien.id); }} title="Duplicar bien">
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setLocation(`/bienes/${bien.id}`); }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
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
