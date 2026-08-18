import React, { useState, useEffect } from 'react';
import { 
  useListConfiguracion, 
  useUpdateConfiguracion,
  useListCatalogos,
  useCreateCatalogo,
  useUpdateCatalogo,
  useDeleteCatalogo,
  useGetDashboardResumen
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Settings, 
  Building2, 
  UserCog, 
  Info, 
  Save, 
  Plus, 
  Pencil, 
  Trash2,
  Database,
  Package,
  Server
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
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

const catalogFormSchema = z.object({
  tipo: z.string().min(1, 'El tipo es requerido'),
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().optional(),
  orden: z.number().int().default(0),
});

export default function Configuracion() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCatalogDialog, setShowCatalogDialog] = useState(false);
  const [editingCatalog, setEditingCatalog] = useState<any>(null);
  const [selectedTipo, setSelectedTipo] = useState<string>('estadoFisico');

  const { data: config, isLoading: isLoadingConfig } = useListConfiguracion();
  const { data: resumen, isLoading: isLoadingResumen } = useGetDashboardResumen();
  const { data: catalogos } = useListCatalogos({ tipo: selectedTipo });
  
  const updateConfig = useUpdateConfiguracion();
  const createCatalogo = useCreateCatalogo();
  const updateCatalogo = useUpdateCatalogo();
  const deleteCatalogo = useDeleteCatalogo();

  const catalogForm = useForm<z.infer<typeof catalogFormSchema>>({
    resolver: zodResolver(catalogFormSchema),
    defaultValues: {
      tipo: selectedTipo,
      nombre: '',
      descripcion: '',
      orden: 0,
    },
  });

  const getConfigValue = (clave: string) => {
    return config?.find(c => c.clave === clave)?.valor || '';
  };

  const handleSaveConfig = (clave: string, valor: string) => {
    updateConfig.mutate(
      { clave, data: { valor } },
      {
        onSuccess: () => {
          toast({ title: "Configuración guardada", description: `Se ha actualizado ${clave}` });
          queryClient.invalidateQueries({ queryKey: ['/api/configuracion'] });
        },
        onError: () => {
          toast({ variant: "destructive", title: "Error", description: "No se pudo guardar la configuración." });
        }
      }
    );
  };

  const handleCatalogSubmit = (values: z.infer<typeof catalogFormSchema>) => {
    if (editingCatalog) {
      updateCatalogo.mutate(
        { id: editingCatalog.id, data: { nombre: values.nombre, descripcion: values.descripcion, orden: values.orden } },
        {
          onSuccess: () => {
            toast({ title: "Catálogo actualizado" });
            queryClient.invalidateQueries({ queryKey: ['/api/catalogos'] });
            setShowCatalogDialog(false);
            setEditingCatalog(null);
            catalogForm.reset();
          },
          onError: () => {
            toast({ variant: "destructive", title: "Error al actualizar" });
          }
        }
      );
    } else {
      createCatalogo.mutate(
        { data: { ...values, tipo: selectedTipo } },
        {
          onSuccess: () => {
            toast({ title: "Catálogo creado" });
            queryClient.invalidateQueries({ queryKey: ['/api/catalogos'] });
            setShowCatalogDialog(false);
            catalogForm.reset();
          },
          onError: () => {
            toast({ variant: "destructive", title: "Error al crear" });
          }
        }
      );
    }
  };

  const handleDeleteCatalog = (id: number) => {
    deleteCatalogo.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Catálogo eliminado" });
          queryClient.invalidateQueries({ queryKey: ['/api/catalogos'] });
        },
        onError: () => {
          toast({ variant: "destructive", title: "Error al eliminar" });
        }
      }
    );
  };

  const catalogTypes = [
    { value: 'estadoFisico', label: 'Estados Físicos' },
    { value: 'estadoAdministrativo', label: 'Estados Administrativos' },
    { value: 'tipoMovimiento', label: 'Tipos de Movimiento' },
    { value: 'tipoAdquisicion', label: 'Tipos de Adquisición' },
    { value: 'jerarquia', label: 'Jerarquías' },
    { value: 'cargo', label: 'Cargos' },
    { value: 'tipoDependencia', label: 'Tipos de Dependencia' },
    { value: 'edificio', label: 'Edificios' },
    { value: 'piso', label: 'Pisos' },
  ];

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración del Sistema</h1>
        <p className="text-muted-foreground mt-1">Administre la información del sistema, catálogos y configuración general.</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent mb-6">
          <TabsTrigger value="general" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3">
            <Settings className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="institucion" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3">
            <Building2 className="w-4 h-4 mr-2" />
            Institución
          </TabsTrigger>
          <TabsTrigger value="admin" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3">
            <UserCog className="w-4 h-4 mr-2" />
            Administrador
          </TabsTrigger>
          <TabsTrigger value="catalogos" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3">
            <Package className="w-4 h-4 mr-2" />
            Catálogos
          </TabsTrigger>
          <TabsTrigger value="acerca" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3">
            <Info className="w-4 h-4 mr-2" />
            Acerca del Sistema
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Sistema</CardTitle>
              <CardDescription>Configure los datos generales del sistema patrimonial.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingConfig ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <>
                  <ConfigField 
                    label="Nombre del Sistema" 
                    value={getConfigValue('sistema.nombre')} 
                    onSave={(v) => handleSaveConfig('sistema.nombre', v)} 
                  />
                  <ConfigField 
                    label="Descripción" 
                    value={getConfigValue('sistema.descripcion')} 
                    onSave={(v) => handleSaveConfig('sistema.descripcion', v)}
                    isTextarea
                  />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="institucion" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Datos Institucionales</CardTitle>
              <CardDescription>Información de la institución a la que pertenece el patrimonio.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingConfig ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <>
                  <ConfigField 
                    label="Nombre de la Institución" 
                    value={getConfigValue('institucion.nombre')} 
                    onSave={(v) => handleSaveConfig('institucion.nombre', v)} 
                  />
                  <ConfigField 
                    label="Unidad" 
                    value={getConfigValue('institucion.unidad')} 
                    onSave={(v) => handleSaveConfig('institucion.unidad', v)} 
                  />
                  <ConfigField 
                    label="Dirección" 
                    value={getConfigValue('institucion.direccion')} 
                    onSave={(v) => handleSaveConfig('institucion.direccion', v)} 
                  />
                  <ConfigField 
                    label="Observaciones" 
                    value={getConfigValue('institucion.observaciones')} 
                    onSave={(v) => handleSaveConfig('institucion.observaciones', v)}
                    isTextarea
                  />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Administrador del Sistema</CardTitle>
              <CardDescription>Información del administrador responsable del sistema.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingConfig ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <>
                  <ConfigField 
                    label="Nombre del Administrador" 
                    value={getConfigValue('admin.nombre')} 
                    onSave={(v) => handleSaveConfig('admin.nombre', v)} 
                  />
                  <ConfigField 
                    label="Cargo" 
                    value={getConfigValue('admin.cargo')} 
                    onSave={(v) => handleSaveConfig('admin.cargo', v)} 
                  />
                  <ConfigField 
                    label="Correo Electrónico" 
                    value={getConfigValue('admin.correo')} 
                    onSave={(v) => handleSaveConfig('admin.correo', v)} 
                  />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="catalogos" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Gestión de Catálogos</CardTitle>
                <CardDescription>Administre los valores de los listas desplegables del sistema.</CardDescription>
              </div>
              <Dialog open={showCatalogDialog} onOpenChange={setShowCatalogDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={() => { setEditingCatalog(null); catalogForm.reset({ tipo: selectedTipo, nombre: '', descripcion: '', orden: 0 }); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingCatalog ? 'Editar' : 'Nuevo'} Elemento de Catálogo</DialogTitle>
                  </DialogHeader>
                  <Form {...catalogForm}>
                    <form onSubmit={catalogForm.handleSubmit(handleCatalogSubmit)} className="space-y-4">
                      {!editingCatalog && (
                        <FormField
                          control={catalogForm.control}
                          name="tipo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {catalogTypes.map(t => (
                                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      <FormField
                        control={catalogForm.control}
                        name="nombre"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={catalogForm.control}
                        name="descripcion"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descripción (opcional)</FormLabel>
                            <FormControl>
                              <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={catalogForm.control}
                        name="orden"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Orden</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setShowCatalogDialog(false)}>Cancelar</Button>
                        <Button type="submit">{editingCatalog ? 'Guardar' : 'Crear'}</Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Select value={selectedTipo} onValueChange={(v) => { setSelectedTipo(v); catalogForm.setValue('tipo', v); }}>
                  <SelectTrigger className="w-full md:w-[300px]">
                    <SelectValue placeholder="Seleccione tipo de catálogo" />
                  </SelectTrigger>
                  <SelectContent>
                    {catalogTypes.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">Orden</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead className="w-[100px]">Estado</TableHead>
                      <TableHead className="w-[100px]">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {catalogos?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                          No hay elementos en este catálogo
                        </TableCell>
                      </TableRow>
                    ) : (
                      catalogos?.map(cat => (
                        <TableRow key={cat.id}>
                          <TableCell className="text-muted-foreground">{cat.orden}</TableCell>
                          <TableCell className="font-medium">{cat.nombre}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{cat.descripcion || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={cat.activo ? "default" : "secondary"}>
                              {cat.activo ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  setEditingCatalog(cat);
                                  catalogForm.reset({ tipo: cat.tipo, nombre: cat.nombre, descripcion: cat.descripcion || '', orden: cat.orden });
                                  setShowCatalogDialog(true);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>¿Eliminar este elemento?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Se eliminará "{cat.nombre}" del catálogo. Esta acción no se puede deshacer.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteCatalog(cat.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                      Eliminar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="acerca" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Acerca del Sistema</CardTitle>
              <CardDescription>Información general del sistema SIGPIC.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingResumen ? (
                <div className="space-y-4">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-6 w-48" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Server className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Versión</div>
                      <div className="font-medium">1.0.0</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Package className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Total de Bienes</div>
                      <div className="font-medium">{resumen?.totalBienes || 0}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Building2 className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Total de Dependencias</div>
                      <div className="font-medium">{resumen?.totalDependencias || 0}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <UserCog className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Total de Responsables</div>
                      <div className="font-medium">{resumen?.totalResponsables || 0}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Database className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Base de Datos</div>
                      <div className="font-medium">PostgreSQL</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ConfigField({ label, value, onSave, isTextarea = false }: { label: string; value: string; onSave: (v: string) => void; isTextarea?: boolean }) {
  const [editValue, setEditValue] = useState(value);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      <div className="flex gap-2">
        {isTextarea ? (
          <Textarea 
            value={editValue} 
            onChange={(e) => setEditValue(e.target.value)}
            className="flex-1"
            disabled={!isEditing}
          />
        ) : (
          <Input 
            value={editValue} 
            onChange={(e) => setEditValue(e.target.value)}
            className="flex-1"
            disabled={!isEditing}
          />
        )}
        {isEditing ? (
          <Button size="sm" onClick={handleSave}>
            <Save className="w-4 h-4" />
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
            <Pencil className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
