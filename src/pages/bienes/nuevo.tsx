import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  useCreateBien, 
  useListCategorias, 
  useListDependencias, 
  useListResponsables,
  useListCatalogos
} from '@workspace/api-client-react';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Server } from 'lucide-react';

const formSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  codigoInterno: z.string().optional(),
  numeroPatrimonial: z.string().optional(),
  numeroSerie: z.string().optional(),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  descripcion: z.string().optional(),
  categoriaId: z.coerce.number().optional(),
  dependenciaId: z.coerce.number().optional(),
  responsableId: z.coerce.number().optional(),
  segundoResponsableId: z.coerce.number().optional(),
  cantidad: z.coerce.number().min(1, 'La cantidad debe ser al menos 1').default(1),
  esComponente: z.boolean().default(false),
  estadoFisico: z.string().min(1, 'Seleccione un estado físico'),
  estadoAdministrativo: z.string().min(1, 'Seleccione un estado administrativo'),
  origenBien: z.string().optional(),
  observaciones: z.string().optional(),
  activo: z.boolean().default(true),
});

export default function NuevoBien() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: categorias } = useListCategorias();
  const { data: dependencias } = useListDependencias();
  const { data: responsables } = useListResponsables();
  
  const { data: estadosFisicos } = useListCatalogos({ tipo: 'estadoFisico', soloActivos: true });
  const { data: estadosAdministrativos } = useListCatalogos({ tipo: 'estadoAdministrativo', soloActivos: true });
  const { data: origenes } = useListCatalogos({ tipo: 'tipoAdquisicion', soloActivos: true });
  
  const createBien = useCreateBien();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: '',
      codigoInterno: '',
      numeroPatrimonial: '',
      numeroSerie: '',
      marca: '',
      modelo: '',
      descripcion: '',
      estadoFisico: '',
      estadoAdministrativo: '',
      origenBien: '',
      observaciones: '',
      cantidad: 1,
      esComponente: false,
      activo: true,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createBien.mutate(
      { data: values },
      {
        onSuccess: (bien) => {
          toast({
            title: "Bien registrado exitosamente",
            description: `Se ha creado el bien ${bien.nombre}`,
          });
          setLocation(`/bienes/${bien.id}`);
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Error al registrar",
            description: "No se pudo registrar el bien patrimonial. Verifique los datos.",
          });
          console.error(error);
        }
      }
    );
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-bottom-4 duration-500">
      <div className="flex items-center space-x-4 mb-2">
        <Button variant="ghost" size="icon" onClick={() => setLocation('/bienes')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Registrar Nuevo Bien</h1>
          <p className="text-muted-foreground mt-1">Ingrese los datos para incorporar un nuevo elemento al patrimonio.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Server className="w-5 h-5 mr-2" />
                  Identificación y Datos Básicos
                </CardTitle>
                <CardDescription>Información principal del elemento.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Bien *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Servidor de Base de Datos" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="codigoInterno"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código Interno</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. IT-SRV-01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="numeroPatrimonial"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nº Patrimonial</FormLabel>
                        <FormControl>
                          <Input placeholder="Nº de inventario" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="marca"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marca</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. Dell, HP, Cisco..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="modelo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Modelo</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. PowerEdge R740" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="numeroSerie"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Serie / Service Tag</FormLabel>
                      <FormControl>
                        <Input placeholder="S/N" {...field} className="font-mono text-sm" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="categoriaId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          const numValue = value ? parseInt(value) : undefined;
                          field.onChange(numValue);
                        }} 
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione categoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categorias?.map(c => (
                            <SelectItem key={c.id} value={c.id.toString()}>{c.nombre}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="esComponente"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm">Es Componente</FormLabel>
                        <FormDescription className="text-xs">
                          Marcar si este bien es un componente de otro.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cantidad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cantidad</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 1)} />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Cantidad de unidades de este bien.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="descripcion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción Técnica</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Especificaciones, características (RAM, CPU, Disco, etc.)" 
                          className="resize-none h-24" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Estado y Ubicación</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="estadoFisico"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado Físico *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {estadosFisicos?.map(e => (
                                <SelectItem key={e.id} value={e.nombre}>{e.nombre}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="estadoAdministrativo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado Admin *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {estadosAdministrativos?.map(e => (
                                <SelectItem key={e.id} value={e.nombre}>{e.nombre}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="dependenciaId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dependencia / Ubicación</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione dependencia" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {dependencias?.map(d => (
                              <SelectItem key={d.id} value={d.id.toString()}>{d.nombre}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="responsableId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Responsable a cargo</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione responsable" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {responsables?.map(r => (
                              <SelectItem key={r.id} value={r.id.toString()}>{r.nombre} ({r.cargo})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="segundoResponsableId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>2do Responsable (opcional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione 2do responsable" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {responsables?.map(r => (
                              <SelectItem key={r.id} value={r.id.toString()}>{r.nombre} ({r.cargo})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Datos Administrativos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="origenBien"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Origen del Bien</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione origen" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {origenes?.map(o => (
                              <SelectItem key={o.id} value={o.nombre}>{o.nombre}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="observaciones"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observaciones adicionales</FormLabel>
                        <FormControl>
                          <Textarea placeholder="..." className="resize-none h-20" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="activo"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Bien Activo
                          </FormLabel>
                          <FormDescription>
                            Marcar si el bien debe figurar en el inventario actual.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="flex justify-end gap-4 border-t pt-6">
            <Button variant="outline" type="button" onClick={() => setLocation('/bienes')}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createBien.isPending} className="min-w-[150px]">
              {createBien.isPending ? (
                "Guardando..."
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Bien
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
