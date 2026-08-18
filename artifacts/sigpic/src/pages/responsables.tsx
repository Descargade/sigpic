import React, { useState } from 'react';
import { useListResponsables, useCreateResponsable, useUpdateResponsable, useDeleteResponsable, useListDependencias } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users2, Plus, Edit2, Trash2, Search } from 'lucide-react';
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
  jerarquia: z.string().optional(),
  cargo: z.string().optional(),
  dependenciaId: z.coerce.number().optional(),
});

export default function Responsables() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [busqueda, setBusqueda] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<any>(null);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  const { data: responsables, isLoading } = useListResponsables();
  const { data: dependencias } = useListDependencias();
  
  const createResp = useCreateResponsable();
  const updateResp = useUpdateResponsable();
  const deleteResp = useDeleteResponsable();

  const createForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { nombre: '', jerarquia: '', cargo: '' }
  });

  const editForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onCreateSubmit = (values: z.infer<typeof formSchema>) => {
    createResp.mutate({ data: values }, {
      onSuccess: () => {
        toast({ title: "Responsable creado" });
        queryClient.invalidateQueries({ queryKey: ["/api/responsables"] });
        setIsCreateOpen(false);
        createForm.reset();
      }
    });
  };

  const onEditSubmit = (values: z.infer<typeof formSchema>) => {
    if (!itemToEdit) return;
    updateResp.mutate({ id: itemToEdit.id, data: values }, {
      onSuccess: () => {
        toast({ title: "Responsable actualizado" });
        queryClient.invalidateQueries({ queryKey: ["/api/responsables"] });
        setIsEditOpen(false);
        setItemToEdit(null);
      }
    });
  };

  const handleDelete = () => {
    if (!itemToDelete) return;
    deleteResp.mutate({ id: itemToDelete.id }, {
      onSuccess: () => {
        toast({ title: "Responsable eliminado" });
        queryClient.invalidateQueries({ queryKey: ["/api/responsables"] });
        setItemToDelete(null);
      },
      onError: () => {
        toast({ variant: "destructive", title: "Error", description: "No se puede eliminar el responsable si tiene bienes asignados." });
        setItemToDelete(null);
      }
    });
  };

  const openEdit = (resp: any) => {
    setItemToEdit(resp);
    editForm.reset({
      nombre: resp.nombre,
      jerarquia: resp.jerarquia || '',
      cargo: resp.cargo || '',
      dependenciaId: resp.dependenciaId
    });
    setIsEditOpen(true);
  };

  const filtered = responsables?.filter(r => 
    r.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    (r.cargo && r.cargo.toLowerCase().includes(busqueda.toLowerCase()))
  ) || [];

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Responsables</h1>
          <p className="text-muted-foreground mt-1">Personal a cargo de bienes patrimoniales.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Responsable
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo Responsable</DialogTitle>
              <DialogDescription>Agregue una nueva persona a cargo del patrimonio.</DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4 pt-4">
                <FormField control={createForm.control} name="nombre" render={({ field }) => (
                  <FormItem><FormLabel>Nombre Completo *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={createForm.control} name="jerarquia" render={({ field }) => (
                    <FormItem><FormLabel>Jerarquía / Grado</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={createForm.control} name="cargo" render={({ field }) => (
                    <FormItem><FormLabel>Cargo / Función</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <FormField control={createForm.control} name="dependenciaId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dependencia Asignada</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Seleccione dependencia" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {dependencias?.map(d => (
                          <SelectItem key={d.id} value={d.id.toString()}>{d.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <DialogFooter className="mt-6">
                  <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={createResp.isPending}>Guardar</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Responsable</DialogTitle>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4 pt-4">
                <FormField control={editForm.control} name="nombre" render={({ field }) => (
                  <FormItem><FormLabel>Nombre Completo *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={editForm.control} name="jerarquia" render={({ field }) => (
                    <FormItem><FormLabel>Jerarquía / Grado</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={editForm.control} name="cargo" render={({ field }) => (
                    <FormItem><FormLabel>Cargo / Función</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <FormField control={editForm.control} name="dependenciaId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dependencia Asignada</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Seleccione dependencia" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {dependencias?.map(d => (
                          <SelectItem key={d.id} value={d.id.toString()}>{d.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <DialogFooter className="mt-6">
                  <Button variant="outline" type="button" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={updateResp.isPending}>Guardar Cambios</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar Responsable</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Está seguro que desea eliminar a <strong>{itemToDelete?.nombre}</strong>? 
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
              placeholder="Buscar por nombre o cargo..."
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
                <TableHead>Nombre Completo</TableHead>
                <TableHead>Jerarquía / Cargo</TableHead>
                <TableHead>Dependencia Base</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <Users2 className="h-10 w-10 mb-2 opacity-20" />
                      <p>No se encontraron responsables.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((resp) => (
                  <TableRow key={resp.id}>
                    <TableCell className="font-medium">{resp.nombre}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        {resp.cargo && <span>{resp.cargo}</span>}
                        {resp.jerarquia && <span className="text-xs text-muted-foreground">{resp.jerarquia}</span>}
                        {!resp.cargo && !resp.jerarquia && '-'}
                      </div>
                    </TableCell>
                    <TableCell>{resp.dependenciaNombre || <span className="text-muted-foreground italic text-xs">Sin asignar</span>}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(resp)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setItemToDelete(resp)} className="text-destructive hover:bg-destructive/10">
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
