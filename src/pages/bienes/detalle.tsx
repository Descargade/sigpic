import React, { useState } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  useGetBien, 
  useGetBienMovimientos, 
  useGetBienComponentes,
  useUpdateBien,
  useDeleteBien,
  useAddBienComponente,
  useRemoveBienComponente,
  useListBienes,
  getGetBienQueryKey,
  getListBienesQueryKey
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Server, 
  History, 
  Layers, 
  Info,
  Calendar,
  Building2,
  User,
  ShieldCheck,
  AlertCircle,
  Copy
} from 'lucide-react';
import { EstadoFisicoBadge, EstadoAdminBadge } from '@/components/status-badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function DetalleBien() {
  const params = useParams();
  const id = parseInt(params.id || '0', 10);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: bien, isLoading } = useGetBien(id);
  const { data: movimientos, isLoading: isLoadingMovimientos } = useGetBienMovimientos(id);
  const { data: componentes, isLoading: isLoadingComponentes } = useGetBienComponentes(id);
  const { data: allBienes } = useListBienes({ soloRaiz: true });
  
  const deleteBien = useDeleteBien();
  const addComponente = useAddBienComponente();
  const removeComponente = useRemoveBienComponente();

  const duplicateBien = useMutation({
    mutationFn: () => fetch(`${import.meta.env.VITE_API_URL || ''}/api/bienes/${id}/duplicar`, { method: 'POST' }).then(r => r.json()),
    onSuccess: (data) => {
      toast({ title: "Bien duplicado", description: `Se creó una copia (${data.codigoInterno}) con ${data.componentesDuplicados || 0} componente(s).` });
      queryClient.invalidateQueries({ queryKey: ['/api/bienes'] });
      setLocation(`/bienes/${data.id}`);
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "No se pudo duplicar el bien." });
    },
  });

  const availableBienes = allBienes?.filter(b => 
    b.id !== id && 
    !componentes?.some(c => c.id === b.id) &&
    (b.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
     b.codigoInterno?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     b.numeroPatrimonial?.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const handleLinkComponent = (componenteId: number) => {
    addComponente.mutate(
      { id, data: { componenteId } },
      {
        onSuccess: () => {
          toast({ title: "Componente vinculado", description: "El bien ha sido vinculado correctamente." });
          queryClient.invalidateQueries({ queryKey: getGetBienQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: ['/api/bienes'] });
          setShowLinkDialog(false);
          setSearchTerm('');
        },
        onError: () => {
          toast({ variant: "destructive", title: "Error", description: "No se pudo vincular el componente." });
        }
      }
    );
  };

  const handleUnlinkComponent = (componenteId: number) => {
    removeComponente.mutate(
      { id, componenteId },
      {
        onSuccess: () => {
          toast({ title: "Componente desvinculado", description: "El bien ha sido desvinculado correctamente." });
          queryClient.invalidateQueries({ queryKey: getGetBienQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: ['/api/bienes'] });
        },
        onError: () => {
          toast({ variant: "destructive", title: "Error", description: "No se pudo desvincular el componente." });
        }
      }
    );
  };

  const handleDelete = () => {
    deleteBien.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Bien eliminado", description: "El bien se ha eliminado permanentemente." });
        queryClient.invalidateQueries({ queryKey: ['/api/bienes'] });
        setLocation('/bienes');
      },
      onError: (err) => {
        toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar el bien. Asegúrese de que no tenga componentes asociados." });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 col-span-2" />
          <Skeleton className="h-64 col-span-1" />
        </div>
      </div>
    );
  }

  if (!bien) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Bien no encontrado</h2>
        <p className="text-muted-foreground mb-6">El elemento patrimonial que busca no existe o fue eliminado.</p>
        <Button variant="outline" onClick={() => setLocation('/bienes')}>Volver a la lista</Button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button variant="outline" size="icon" onClick={() => setLocation('/bienes')} className="mt-1 shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold tracking-tight">{bien.nombre}</h1>
              {!bien.activo && <Badge variant="destructive">INACTIVO</Badge>}
            </div>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <span className="font-mono text-sm">{bien.codigoInterno || 'Sin código interno'}</span>
              <span>•</span>
              <span>Nº Patrimonial: {bien.numeroPatrimonial || 'N/A'}</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" className="gap-2" onClick={() => duplicateBien.mutate()} disabled={duplicateBien.isPending}>
            <Copy className="h-4 w-4" />
            {duplicateBien.isPending ? 'Duplicando...' : 'Duplicar'}
          </Button>
          <Button variant="outline" className="gap-2" asChild>
            <a href={`/bienes/${id}/editar`}>
              <Edit className="h-4 w-4" />
              Editar
            </a>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" />
                Eliminar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Está absolutamente seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Eliminará permanentemente el bien y todos sus movimientos asociados del sistema patrimonial.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Sí, eliminar bien
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Tabs defaultValue="detalle" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent mb-6">
              <TabsTrigger 
                value="detalle" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                <Info className="w-4 h-4 mr-2" />
                Detalle Técnico
              </TabsTrigger>
              <TabsTrigger 
                value="movimientos" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                <History className="w-4 h-4 mr-2" />
                Historial de Movimientos
              </TabsTrigger>
              <TabsTrigger 
                value="componentes" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                <Layers className="w-4 h-4 mr-2" />
                Componentes ({bien.cantidadComponentes || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="detalle" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Especificaciones</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Categoría</div>
                      <div className="font-medium">{bien.categoriaNombre || 'Sin categorizar'}</div>
                    </div>
                    {bien.subcategoriaNombre && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Subcategoría</div>
                        <div className="font-medium">{bien.subcategoriaNombre}</div>
                      </div>
                    )}
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Marca</div>
                      <div className="font-medium">{bien.marca || '-'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Modelo</div>
                      <div className="font-medium">{bien.modelo || '-'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Número de Serie (S/N)</div>
                      <div className="font-medium font-mono">{bien.numeroSerie || '-'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Origen del Bien</div>
                      <div className="font-medium">{bien.origenBien || '-'}</div>
                    </div>
                  </div>

                  {bien.descripcion && (
                    <div className="pt-4 border-t">
                      <div className="text-sm text-muted-foreground mb-2">Descripción Detallada</div>
                      <div className="text-sm whitespace-pre-wrap">{bien.descripcion}</div>
                    </div>
                  )}
                  {bien.observaciones && (
                    <div className="pt-4 border-t">
                      <div className="text-sm text-muted-foreground mb-2">Observaciones Administrativas</div>
                      <div className="text-sm text-muted-foreground bg-muted p-4 rounded-md whitespace-pre-wrap">{bien.observaciones}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="movimientos">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Registro de Actividad</CardTitle>
                    <CardDescription>Historial de cambios de estado y ubicación</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {movimientos?.length || 0} movimiento(s)
                  </Badge>
                </CardHeader>
                <CardContent>
                  {isLoadingMovimientos ? (
                    <div className="space-y-4">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ) : movimientos?.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                        <History className="w-6 h-6 opacity-40" />
                      </div>
                      <p className="font-medium">Sin movimientos registrados</p>
                      <p className="text-sm mt-1">Los cambios de estado y ubicación aparecerán aquí.</p>
                    </div>
                  ) : (
                    <div className="relative border-l-2 border-primary/20 ml-3 pl-6 space-y-6 py-2">
                      {movimientos?.map((mov, idx) => {
                        const tipoColor: Record<string, string> = {
                          'Alta': 'bg-emerald-500',
                          'Baja': 'bg-red-500',
                          'Cambio de estado': 'bg-amber-500',
                          'Cambio de ubicación': 'bg-blue-500',
                          'Cambio de dependencia': 'bg-purple-500',
                          'Cambio de responsable': 'bg-indigo-500',
                          'Duplicación': 'bg-cyan-500',
                        };
                        const dotColor = tipoColor[mov.tipo] || 'bg-primary';
                        const isFirst = idx === 0;

                        return (
                          <div key={mov.id} className={`relative ${isFirst ? 'animate-in slide-in-from-left-4 duration-300' : ''}`}>
                            <div className={`absolute -left-[33px] ${dotColor} ${isFirst ? 'w-4 h-4 ring-4 ring-background' : 'w-3 h-3 mt-0.5'} rounded-full border-2 border-background transition-all`}></div>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-1">
                              <div className="flex items-center gap-2">
                                <span className={`font-medium text-sm ${isFirst ? 'text-primary' : ''}`}>{mov.tipo}</span>
                                {isFirst && <Badge variant="outline" className="text-[9px] px-1.5 py-0">Último</Badge>}
                              </div>
                              <span className="text-xs text-muted-foreground font-mono">
                                {format(new Date(mov.fecha), "dd/MM/yyyy HH:mm", { locale: es })}
                              </span>
                            </div>
                            
                            <div className="mt-2 text-sm space-y-1.5 bg-muted/30 p-3 rounded-md border border-border/30">
                              {mov.descripcion && <p className="italic text-muted-foreground text-xs">"{mov.descripcion}"</p>}
                              
                              {(mov.estadoFisicoAnterior || mov.estadoFisicoNuevo) && (
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="text-muted-foreground w-16 shrink-0">Estado:</span>
                                  {mov.estadoFisicoAnterior ? (
                                    <>
                                      <span className="line-through opacity-60">{mov.estadoFisicoAnterior}</span>
                                      <span className="text-muted-foreground">→</span>
                                    </>
                                  ) : null}
                                  <span className="font-medium">{mov.estadoFisicoNuevo}</span>
                                </div>
                              )}
                              
                              {(mov.dependenciaNombre || mov.responsableNombre) && (
                                <div className="flex flex-col gap-1 pt-1.5 mt-1.5 border-t border-border/30">
                                  {mov.dependenciaNombre && (
                                    <div className="flex items-center text-xs text-muted-foreground">
                                      <Building2 className="w-3 h-3 mr-1.5 shrink-0" />
                                      <span className="truncate">Ubicado en {mov.dependenciaNombre}</span>
                                    </div>
                                  )}
                                  {mov.responsableNombre && (
                                    <div className="flex items-center text-xs text-muted-foreground">
                                      <User className="w-3 h-3 mr-1.5 shrink-0" />
                                      <span className="truncate">Asignado a {mov.responsableNombre}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="text-[10px] text-muted-foreground/60 mt-1.5 flex items-center justify-end">
                              <ShieldCheck className="w-2.5 h-2.5 mr-1" />
                              {mov.usuario}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="componentes">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Componentes Vinculados</CardTitle>
                    <CardDescription>Sub-bienes o partes que conforman este elemento</CardDescription>
                  </div>
                  <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">Vincular Componente</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Vincular Componente</DialogTitle>
                        <DialogDescription>
                          Busque y seleccione un bien para vincular como componente.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          placeholder="Buscar por nombre, código o patrimonio..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="max-h-[300px] overflow-y-auto space-y-2">
                          {availableBienes.length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground text-sm">
                              {searchTerm ? 'No se encontraron resultados' : 'No hay bienes disponibles para vincular'}
                            </div>
                          ) : (
                            availableBienes.map(b => (
                              <div 
                                key={b.id} 
                                className="flex items-center justify-between p-3 border rounded-md hover:bg-accent/50 transition-colors cursor-pointer"
                                onClick={() => handleLinkComponent(b.id)}
                              >
                                <div className="flex items-center gap-3">
                                  <Server className="w-4 h-4 text-muted-foreground" />
                                  <div>
                                    <div className="font-medium text-sm">{b.nombre}</div>
                                    <div className="text-xs text-muted-foreground font-mono">
                                      {b.codigoInterno || b.numeroPatrimonial || 'S/N'}
                                    </div>
                                  </div>
                                </div>
                                <EstadoFisicoBadge status={b.estadoFisico} className="text-[10px] h-5 px-1.5" />
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {isLoadingComponentes ? (
                    <div className="space-y-2">
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : componentes?.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                      Este bien no tiene componentes vinculados.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {componentes?.map(comp => (
                        <div key={comp.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-accent/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <Server className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <div className="font-medium text-sm">
                                <Link href={`/bienes/${comp.id}`} className="hover:underline">{comp.nombre}</Link>
                              </div>
                              <div className="text-xs text-muted-foreground font-mono">
                                {comp.codigoInterno || comp.numeroPatrimonial || 'S/N'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <EstadoFisicoBadge status={comp.estadoFisico} className="text-[10px] h-5 px-1.5" />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-7 px-2 text-destructive hover:text-destructive">
                                  Desvincular
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Desvincular componente?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    El bien "{comp.nombre}" quedará como bien independiente.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleUnlinkComponent(comp.id)}>
                                    Desvincular
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          {/* ─── RESUMEN RÁPIDO ──────────────────────────────────────────── */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Server className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{bien.nombre}</p>
                  <p className="text-xs text-muted-foreground font-mono">{bien.codigoInterno || 'Sin código'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-2 rounded-lg bg-background/50">
                  <div className="text-lg font-bold">{bien.cantidadComponentes || 0}</div>
                  <div className="text-[10px] text-muted-foreground">Componentes</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-background/50">
                  <div className="text-lg font-bold">{movimientos?.length || 0}</div>
                  <div className="text-[10px] text-muted-foreground">Movimientos</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Estado Actual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Físico</span>
                <EstadoFisicoBadge status={bien.estadoFisico} className="text-[10px] h-5 px-1.5" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Administrativo</span>
                <EstadoAdminBadge status={bien.estadoAdministrativo} className="text-[10px] h-5 px-1.5" />
              </div>
              <div className="pt-2 border-t flex items-center text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                Alta: {format(new Date(bien.fechaAlta), "dd/MM/yyyy")}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Ubicación y Responsable
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="flex items-start gap-2">
                <Building2 className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Dependencia</div>
                  <div className="text-sm font-medium">{bien.dependenciaNombre || 'No asignada'}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <User className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Responsable</div>
                  <div className="text-sm font-medium">{bien.responsableNombre || 'No asignado'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ─── ACCIONES RÁPIDAS ──────────────────────────────────────────── */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Acciones Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <Button variant="outline" size="sm" className="w-full justify-start gap-2" asChild>
                <a href={`/bienes/${id}/editar`}>
                  <Edit className="w-3.5 h-3.5" />
                  Editar bien
                </a>
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={() => duplicateBien.mutate()} disabled={duplicateBien.isPending}>
                <Copy className="w-3.5 h-3.5" />
                {duplicateBien.isPending ? 'Duplicando...' : 'Duplicar bien'}
              </Button>
            </CardContent>
          </Card>
          
          {bien.parentId && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-sm text-primary flex items-center">
                  <Layers className="w-4 h-4 mr-2" />
                  Es componente de
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Link href={`/bienes/${bien.parentId}`} className="font-medium text-sm hover:underline">
                  {bien.parentNombre}
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
