import React, { useState } from 'react';
import { useListDependencias, useCreateDependencia, useUpdateDependencia, useDeleteDependencia, useListCatalogos, useListResponsables } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Plus, Edit2, Trash2, Search } from 'lucide-react';
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
} from "@/components/ui/alert-dialog";

const formSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  edificio: z.string().optional(),
  piso: z.string().optional(),
  ubicacion: z.string().optional(),
  descripcion: z.string().optional(),
  responsableId: z.string().optional(),
  observaciones: z.string().optional(),
});

export default function Dependencias() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [busqueda, setBusqueda] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<any>(null);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  const { data: dependencias, isLoading } = useListDependencias();
  const { data: edificios } = useListCatalogos({ tipo: 'edificio', soloActivos: true });
  const { data: pisos } = useListCatalogos({ tipo: 'piso', soloActivos: true });
  const { data: responsables } = useListResponsables();
  const createDep = useCreateDependencia();
  const updateDep = useUpdateDependencia();
  const deleteDep = useDeleteDependencia();

  const createForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { nombre: '', edificio: '', piso: '', ubicacion: '', descripcion: '', responsableId: '', observaciones: '' }
  });

  const editForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onCreateSubmit = (values: z.infer<typeof formSchema>) => {
    const payload: any = { ...values };
    if (values.responsableId) payload.responsableId = Number(values.responsableId);
    else payload.responsableId = null;
    createDep.mutate({ data: payload }, {
      onSuccess: () => {
        toast({ title: "Dependencia creada" });
        queryClient.invalidateQueries({ queryKey: ["/api/dependencias"] });
        setIsCreateOpen(false);
        createForm.reset();
      }
    });
  };

  const onEditSubmit = (values: z.infer<typeof formSchema>) => {
    if (!itemToEdit) return;
    const payload: any = { ...values };
    if (values.responsableId) payload.responsableId = Number(values.responsableId);
    else payload.responsableId = null;
    updateDep.mutate({ id: itemToEdit.id, data: payload }, {
      onSuccess: () => {
        toast({ title: "Dependencia actualizada" });
        queryClient.invalidateQueries({ queryKey: ["/api/dependencias"] });
        setIsEditOpen(false);
        setItemToEdit(null);
      }
    });
  };

  const handleDelete = () => {
    if (!itemToDelete) return;
    deleteDep.mutate({ id: itemToDelete.id }, {
      onSuccess: () => {
        toast({ title: "Dependencia eliminada" });
        queryClient.invalidateQueries({ queryKey: ["/api/dependencias"] });
        setItemToDelete(null);
      },
      onError: () => {
        toast({ variant: "destructive", title: "Error", description: "No se puede eliminar la dependencia si tiene bienes asignados." });
        setItemToDelete(null);
      }
    });
  };

  const openEdit = (dep: any) => {
    setItemToEdit(dep);
    editForm.reset({
      nombre: dep.nombre,
      edificio: dep.edificio || '',
      piso: dep.piso || '',
      ubicacion: dep.ubicacion || '',
      descripcion: dep.descripcion || '',
      responsableId: dep.responsableId ? String(dep.responsableId) : '',
      observaciones: dep.observaciones || ''
    });
    setIsEditOpen(true);
  };

  const filtered = dependencias?.filter(d =>
    d.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (d.edificio && d.edificio.toLowerCase().includes(busqueda.toLowerCase())) ||
    (d.piso && d.piso.toLowerCase().includes(busqueda.toLowerCase())) ||
    (d.ubicacion && d.ubicacion.toLowerCase().includes(busqueda.toLowerCase()))
  ) || [];

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dependencias</h1>
          <p className="text-muted-foreground mt-1">Áreas institucionales, oficinas y ubicaciones físicas.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva Dependencia
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva Dependencia</DialogTitle>
              <DialogDescription>Agregue una nueva área institucional al sistema.</DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4 pt-4">
                <FormField control={createForm.control} name="nombre" render={({ field }) => (
                  <FormItem><FormLabel>Nombre *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={createForm.control} name="edificio" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Edificio</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Seleccione edificio" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {edificios?.map(e => (
                          <SelectItem key={e.id} value={e.nombre}>{e.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={createForm.control} name="piso" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Piso</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Seleccione piso" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {pisos?.map(p => (
                          <SelectItem key={p.id} value={p.nombre}>{p.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={createForm.control} name="ubicacion" render={({ field }) => (
                  <FormItem><FormLabel>Ubicación Específica</FormLabel><FormControl><Input placeholder="Ej. Ala Norte, Oficina 3, Sala de Sistemas" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={createForm.control} name="responsableId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsable de Dependencia</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Seleccione responsable" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {responsables?.map(r => (
                          <SelectItem key={r.id} value={String(r.id)}>{r.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={createForm.control} name="descripcion" render={({ field }) => (
                  <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea className="h-20" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <DialogFooter className="mt-6">
                  <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={createDep.isPending}>Guardar</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Dependencia</DialogTitle>
              <DialogDescription>Modifique los datos del área institucional.</DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4 pt-4">
                <FormField control={editForm.control} name="nombre" render={({ field }) => (
                  <FormItem><FormLabel>Nombre *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={editForm.control} name="edificio" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Edificio</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Seleccione edificio" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {edificios?.map(e => (
                          <SelectItem key={e.id} value={e.nombre}>{e.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={editForm.control} name="piso" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Piso</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Seleccione piso" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {pisos?.map(p => (
                          <SelectItem key={p.id} value={p.nombre}>{p.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={editForm.control} name="ubicacion" render={({ field }) => (
                  <FormItem><FormLabel>Ubicación Específica</FormLabel><FormControl><Input placeholder="Ej. Ala Norte, Oficina 3, Sala de Sistemas" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={editForm.control} name="responsableId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsable de Dependencia</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Seleccione responsable" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {responsables?.map(r => (
                          <SelectItem key={r.id} value={String(r.id)}>{r.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={editForm.control} name="descripcion" render={({ field }) => (
                  <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea className="h-20" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <DialogFooter className="mt-6">
                  <Button variant="outline" type="button" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={updateDep.isPending}>Guardar Cambios</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar Dependencia</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Está seguro que desea eliminar la dependencia <strong>{itemToDelete?.nombre}</strong>?
                Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar dependencias..."
              className="pl-9"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre de la Dependencia</TableHead>
                <TableHead>Edificio</TableHead>
                <TableHead>Piso</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Responsable Principal</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <Building2 className="h-10 w-10 mb-2 opacity-20" />
                      <p>No se encontraron dependencias.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((dep) => (
                  <TableRow key={dep.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{dep.nombre}</span>
                        {dep.descripcion && <span className="text-xs text-muted-foreground font-normal mt-1">{dep.descripcion}</span>}
                      </div>
                    </TableCell>
                    <TableCell>{dep.edificio || '-'}</TableCell>
                    <TableCell>{dep.piso || '-'}</TableCell>
                    <TableCell>{dep.ubicacion || '-'}</TableCell>
                    <TableCell>{dep.responsableNombre || <span className="text-muted-foreground italic text-xs">Sin asignar</span>}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(dep)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setItemToDelete(dep)} className="text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
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
