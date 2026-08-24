import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Search, FilterX, Shield, Plus, Pencil, Trash2, Activity, Users, Server, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

type AuditoriaEntry = {
  id: number;
  accion: string;
  entidad: string;
  entidadId: number;
  entidadNombre: string | null;
  datosAnteriores: any;
  datosNuevos: any;
  usuario: string;
  ip: string | null;
  observaciones: string | null;
  fecha: string;
};

type AuditStats = {
  totalRegistros: number;
  porEntidad: Array<{ entidad: string; accion: string; cantidad: number }>;
  porUsuario: Array<{ usuario: string; cantidad: number }>;
  ultimas7dias: Array<{ fecha: string; cantidad: number }>;
};

const ENTIDADES = [
  { value: 'bien', label: 'Bienes' },
  { value: 'categoria', label: 'Categorías' },
  { value: 'dependencia', label: 'Dependencias' },
  { value: 'responsable', label: 'Responsables' },
  { value: 'configuracion', label: 'Configuración' },
];

const ACCIONES = [
  { value: 'CREATE', label: 'Creación' },
  { value: 'UPDATE', label: 'Actualización' },
  { value: 'DELETE', label: 'Eliminación' },
];

const accionBadge: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
  CREATE: { variant: 'default', icon: <Plus className="w-3 h-3" /> },
  UPDATE: { variant: 'secondary', icon: <Pencil className="w-3 h-3" /> },
  DELETE: { variant: 'destructive', icon: <Trash2 className="w-3 h-3" /> },
};

const entidadIcon: Record<string, React.ReactNode> = {
  bien: <Server className="w-3.5 h-3.5" />,
  categoria: <Activity className="w-3.5 h-3.5" />,
  dependencia: <Activity className="w-3.5 h-3.5" />,
  responsable: <Users className="w-3.5 h-3.5" />,
  configuracion: <Activity className="w-3.5 h-3.5" />,
};

function DiffViewer({ antes, despues }: { antes: any; despues: any }) {
  if (!antes && !despues) return <span className="text-muted-foreground text-xs">-</span>;

  const campos = [...new Set([...Object.keys(antes || {}), ...Object.keys(despues || {})])];
  if (campos.length === 0) return <span className="text-muted-foreground text-xs">-</span>;

  return (
    <div className="text-xs space-y-0.5 max-w-[300px]">
      {campos.slice(0, 5).map(campo => (
        <div key={campo} className="flex gap-1">
          <span className="font-medium text-muted-foreground shrink-0">{campo}:</span>
          {antes?.[campo] !== undefined && (
            <span className="line-through text-red-500/70">{String(antes[campo]).substring(0, 30)}</span>
          )}
          {antes?.[campo] !== undefined && <span className="text-muted-foreground">→</span>}
          {despues?.[campo] !== undefined && (
            <span className="text-green-600">{String(despues[campo]).substring(0, 30)}</span>
          )}
        </div>
      ))}
      {campos.length > 5 && (
        <span className="text-muted-foreground">+{campos.length - 5} campo(s) más</span>
      )}
    </div>
  );
}

export default function AuditoriaPage() {
  const [entidad, setEntidad] = useState<string>('todas');
  const [accion, setAccion] = useState<string>('todas');
  const [usuario, setUsuario] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [page, setPage] = useState(1);
  const limit = 30;

  const { data, isLoading } = useQuery({
    queryKey: ['auditoria', entidad, accion, usuario, busqueda, page],
    queryFn: () => {
      const params = new URLSearchParams();
      if (entidad !== 'todas') params.set('entidad', entidad);
      if (accion !== 'todas') params.set('accion', accion);
      if (usuario) params.set('usuario', usuario);
      if (busqueda) params.set('busqueda', busqueda);
      params.set('page', String(page));
      params.set('limit', String(limit));
      return fetch(`/api/auditoria?${params}`).then(r => r.json());
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['auditoria-stats'],
    queryFn: () => fetch('/api/auditoria/stats').then(r => r.json()),
  });

  const registros: AuditoriaEntry[] = data?.data ?? [];
  const pagination = data?.pagination;

  const clearFilters = () => {
    setEntidad('todas');
    setAccion('todas');
    setUsuario('');
    setBusqueda('');
    setPage(1);
  };

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="w-8 h-8" />
          Auditoría del Sistema
        </h1>
        <p className="text-muted-foreground mt-1">Registro completo de acciones realizadas en el sistema patrimonial.</p>
      </div>

      {/* ─── STATS CARDS ──────────────────────────────────────────────────── */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Registros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRegistros.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Por Entidad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {stats.porEntidad
                  .reduce((acc: Array<{ entidad: string; total: number }>, item: { entidad: string; accion: string; cantidad: number }) => {
                    const existing = acc.find((a: { entidad: string; total: number }) => a.entidad === item.entidad);
                    if (existing) existing.total += item.cantidad;
                    else acc.push({ entidad: item.entidad, total: item.cantidad });
                    return acc;
                  }, [])
                  .sort((a: { entidad: string; total: number }, b: { entidad: string; total: number }) => b.total - a.total)
                  .slice(0, 4)
                  .map((item: { entidad: string; total: number }) => (
                    <div key={item.entidad} className="flex justify-between text-xs">
                      <span className="text-muted-foreground capitalize">{item.entidad}</span>
                      <span className="font-medium">{item.total}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {stats.porUsuario.slice(0, 4).map((item: { usuario: string; cantidad: number }) => (
                  <div key={item.usuario} className="flex justify-between text-xs">
                    <span className="text-muted-foreground truncate max-w-[120px]">{item.usuario}</span>
                    <span className="font-medium">{item.cantidad}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Actividad (7 días)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {stats.ultimas7dias.slice(-5).map((item: { fecha: string; cantidad: number }) => (
                  <div key={item.fecha} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{item.fecha}</span>
                    <span className="font-medium">{item.cantidad} acciones</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── FILTROS ──────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative col-span-1 lg:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, usuario u observación..."
                className="pl-9"
                value={busqueda}
                onChange={(e) => { setBusqueda(e.target.value); setPage(1); }}
              />
            </div>

            <Select value={entidad} onValueChange={(v) => { setEntidad(v); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Entidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las entidades</SelectItem>
                {ENTIDADES.map(e => (
                  <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={accion} onValueChange={(v) => { setAccion(v); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Acción" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las acciones</SelectItem>
                {ACCIONES.map(a => (
                  <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Input
                placeholder="Usuario..."
                value={usuario}
                onChange={(e) => { setUsuario(e.target.value); setPage(1); }}
              />
              <Button variant="outline" size="icon" onClick={clearFilters} title="Limpiar filtros">
                <FilterX className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── TABLA ────────────────────────────────────────────────────────── */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[160px]">Fecha/Hora</TableHead>
                <TableHead className="w-[100px]">Acción</TableHead>
                <TableHead className="w-[120px]">Entidad</TableHead>
                <TableHead>Registro</TableHead>
                <TableHead>Cambios</TableHead>
                <TableHead className="w-[100px]">Usuario</TableHead>
                <TableHead className="w-[100px]">IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  </TableRow>
                ))
              ) : registros.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Shield className="h-10 w-10 mb-4 opacity-20" />
                      <p>No se encontraron registros de auditoría.</p>
                      <Button variant="link" onClick={clearFilters} className="mt-2">
                        Limpiar búsqueda
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                registros.map((reg) => {
                  const badge = accionBadge[reg.accion] || accionBadge.UPDATE;
                  return (
                    <TableRow key={reg.id} className="hover:bg-muted/50">
                      <TableCell className="text-xs font-mono">
                        {format(new Date(reg.fecha), "dd/MM/yyyy HH:mm:ss", { locale: es })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={badge.variant} className="gap-1 text-[10px]">
                          {badge.icon}
                          {reg.accion}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs">
                          {entidadIcon[reg.entidad] || <Activity className="w-3.5 h-3.5" />}
                          <span className="capitalize">{reg.entidad}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <span className="font-medium">{reg.entidadNombre || `#${reg.entidadId}`}</span>
                          <span className="text-muted-foreground ml-1">(ID: {reg.entidadId})</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DiffViewer antes={reg.datosAnteriores} despues={reg.datosNuevos} />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{reg.usuario}</TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">{reg.ip || '-'}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ─── PAGINACIÓN ───────────────────────────────────────────────────── */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} registros
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
