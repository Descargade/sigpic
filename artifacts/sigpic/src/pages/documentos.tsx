import React, { useState, useCallback, useEffect } from 'react';
import { pdf, PDFViewer } from '@react-pdf/renderer';
import {
  useListDependencias,
  useListResponsables,
  useListCategorias,
  useListBienes,
  useListConfiguracion,
} from '@workspace/api-client-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText,
  Download,
  Building2,
  User,
  Package,
  FileSpreadsheet,
  Eye,
  Printer,
  ClipboardList,
  Handshake,
  ArrowRightLeft,
  Trash2,
} from 'lucide-react';
import { InventarioPDF } from '@/components/pdf/InventarioPDF';
import { ActaResponsabilidadPDF } from '@/components/pdf/ActaResponsabilidadPDF';
import { ActaEntregaPDF } from '@/components/pdf/ActaEntregaPDF';
import { ActaBajaPDF } from '@/components/pdf/ActaBajaPDF';

function useConfigValue(clave: string): string {
  const { data: config } = useListConfiguracion();
  return config?.find(c => c.clave === clave)?.valor || '';
}

export default function Documentos() {
  const [selectedDependencia, setSelectedDependencia] = useState<string>('');
  const [selectedResponsable, setSelectedResponsable] = useState<string>('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('');
  const [selectedBien, setSelectedBien] = useState<string>('');
  const [selectedBienes, setSelectedBienes] = useState<string[]>([]);
  const [selectedEntregaResponsable, setSelectedEntregaResponsable] = useState<string>('');
  const [entregaNombre, setEntregaNombre] = useState<string>('');
  const [entregaCargo, setEntregaCargo] = useState<string>('');
  const [recibeNombre, setRecibeNombre] = useState<string>('');
  const [recibeCargo, setRecibeCargo] = useState<string>('');
  const [bajaFirmanteNombre, setBajaFirmanteNombre] = useState<string>('');
  const [bajaFirmanteCargo, setBajaFirmanteCargo] = useState<string>('');
  const [previewDoc, setPreviewDoc] = useState<any>(null);
  const [movimientosBien, setMovimientosBien] = useState<any[]>([]);
  const [responsableAnterior, setResponsableAnterior] = useState<string | null>(null);

  const { data: dependencias } = useListDependencias();
  const { data: responsables } = useListResponsables();
  const { data: categorias } = useListCategorias();
  const { data: allBienes, isLoading: isLoadingBienes } = useListBienes({});

  const institucion = useConfigValue('institucion.nombre');
  const unidad = useConfigValue('institucion.unidad');

  const bienesFiltrados = allBienes?.filter(b => !b.parentId) || [];
  const bienSeleccionado = allBienes?.find(b => b.id === parseInt(selectedBien || '0'));
  const bienesSeleccionados = bienesFiltrados.filter(b => selectedBienes.includes(b.id.toString()));
  const responsableSeleccionado = responsables?.find(r => r.id === parseInt(selectedResponsable || '0'));
  const entregaResponsableSeleccionado = responsables?.find(r => r.id === parseInt(selectedEntregaResponsable || '0'));
  const bienesEntrega = selectedEntregaResponsable
    ? bienesFiltrados.filter(b => b.responsableId === parseInt(selectedEntregaResponsable))
    : [];

  const toggleBien = (id: string) => {
    setSelectedBienes(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleAllBienes = () => {
    if (selectedBienes.length === bienesEntrega.length) {
      setSelectedBienes([]);
    } else {
      setSelectedBienes(bienesEntrega.map(b => b.id.toString()));
    }
  };

  useEffect(() => {
    if (!selectedBien) {
      setMovimientosBien([]);
      setResponsableAnterior(null);
      return;
    }
    const bienId = parseInt(selectedBien);
    fetch(`/api/reportes/documentos/acta-baja/${bienId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.movimientos) setMovimientosBien(data.movimientos);
      })
      .catch(() => setMovimientosBien([]));
    fetch(`/api/reportes/documentos/acta-entrega/${bienId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.responsableAnterior) setResponsableAnterior(data.responsableAnterior);
      })
      .catch(() => setResponsableAnterior(null));
  }, [selectedBien]);

  const buildInventarioPDF = useCallback((filtro?: { dependenciaId?: string; responsableId?: string; categoriaId?: string }) => {
    let filtered = bienesFiltrados;
    if (filtro?.dependenciaId && filtro.dependenciaId !== '__all__') filtered = filtered.filter(b => b.dependenciaId === parseInt(filtro.dependenciaId!));
    if (filtro?.responsableId && filtro.responsableId !== '__all__') filtered = filtered.filter(b => b.responsableId === parseInt(filtro.responsableId!));
    if (filtro?.categoriaId && filtro.categoriaId !== '__all__') filtered = filtered.filter(b => b.categoriaId === parseInt(filtro.categoriaId!));

    const filtros: Record<string, string> = {};
    if (filtro?.dependenciaId && filtro.dependenciaId !== '__all__') {
      const dep = dependencias?.find(d => d.id === parseInt(filtro.dependenciaId!));
      if (dep) filtros['Dependencia'] = dep.nombre;
    }
    if (filtro?.responsableId && filtro.responsableId !== '__all__') {
      const resp = responsables?.find(r => r.id === parseInt(filtro.responsableId!));
      if (resp) filtros['Responsable'] = resp.nombre;
    }
    if (filtro?.categoriaId && filtro.categoriaId !== '__all__') {
      const cat = categorias?.find(c => c.id === parseInt(filtro.categoriaId!));
      if (cat) filtros['Categoría'] = cat.nombre;
    }

    return (
      <InventarioPDF
        titulo="Inventario General de Bienes"
        subtitulo={Object.keys(filtros).length > 0 ? `Filtrado por: ${Object.values(filtros).join(', ')}` : 'Listado completo del patrimonio institucional'}
        bienes={filtered.map(b => ({
          ...b,
          fechaAlta: b.fechaAlta?.toString() || '',
        }))}
        filtros={filtros}
        institucion={institucion || 'Institución'}
        unidad={unidad || 'Unidad'}
      />
    );
  }, [bienesFiltrados, dependencias, responsables, categorias, institucion, unidad]);

  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = useCallback(async (doc: React.ReactElement, filename: string) => {
    setDownloading(filename);
    try {
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error generating PDF:', e);
    } finally {
      setDownloading(null);
    }
  }, []);

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Documentos Institucionales</h1>
        <p className="text-muted-foreground mt-1">Genere documentos patrimoniales con formato profesional para impresión y firma.</p>
      </div>

      <Tabs defaultValue="inventario" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent mb-6">
          <TabsTrigger value="inventario" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">
            <ClipboardList className="w-4 h-4 mr-2" />
            Inventario
          </TabsTrigger>
          <TabsTrigger value="acta-responsabilidad" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">
            <User className="w-4 h-4 mr-2" />
            Acta de Responsabilidad
          </TabsTrigger>
          <TabsTrigger value="acta-entrega" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">
            <ArrowRightLeft className="w-4 h-4 mr-2" />
            Acta de Entrega
          </TabsTrigger>
          <TabsTrigger value="acta-baja" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">
            <Trash2 className="w-4 h-4 mr-2" />
            Acta de Baja
          </TabsTrigger>
        </TabsList>

        {/* ─── INVENTARIO ─────────────────────────────────────────────────── */}
        <TabsContent value="inventario" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Inventario de Bienes</CardTitle>
              <CardDescription>Genere listados patrimoniales en formato PDF.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center">
                    <Building2 className="w-4 h-4 mr-1.5" />
                    Dependencia
                  </label>
                  <Select value={selectedDependencia} onValueChange={setSelectedDependencia}>
                    <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">Todas</SelectItem>
                      {dependencias?.map(d => (
                        <SelectItem key={d.id} value={d.id.toString()}>{d.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center">
                    <User className="w-4 h-4 mr-1.5" />
                    Responsable
                  </label>
                  <Select value={selectedResponsable} onValueChange={setSelectedResponsable}>
                    <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">Todos</SelectItem>
                      {responsables?.map(r => (
                        <SelectItem key={r.id} value={r.id.toString()}>{r.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center">
                    <Package className="w-4 h-4 mr-1.5" />
                    Categoría
                  </label>
                  <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
                    <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">Todas</SelectItem>
                      {categorias?.map(c => (
                        <SelectItem key={c.id} value={c.id.toString()}>{c.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={() => {
                    const doc = buildInventarioPDF({
                      dependenciaId: selectedDependencia,
                      responsableId: selectedResponsable,
                      categoriaId: selectedCategoria,
                    });
                    setPreviewDoc(doc);
                  }}
                  className="gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Vista Previa
                </Button>

                <Button
                  variant="outline"
                  disabled={downloading === `SIGPIC_Inventario_${new Date().toISOString().slice(0, 10)}.pdf`}
                  onClick={() => handleDownload(
                    buildInventarioPDF({
                      dependenciaId: selectedDependencia,
                      responsableId: selectedResponsable,
                      categoriaId: selectedCategoria,
                    }),
                    `SIGPIC_Inventario_${new Date().toISOString().slice(0, 10)}.pdf`
                  )}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  {downloading === `SIGPIC_Inventario_${new Date().toISOString().slice(0, 10)}.pdf` ? 'Generando...' : 'Descargar PDF'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── ACTA DE RESPONSABILIDAD ────────────────────────────────────── */}
        <TabsContent value="acta-responsabilidad" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Acta de Responsabilidad</CardTitle>
              <CardDescription>Documento con el listado de bienes asignados a un responsable.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center">
                  <User className="w-4 h-4 mr-1.5" />
                  Responsable
                </label>
                <Select value={selectedResponsable} onValueChange={setSelectedResponsable}>
                  <SelectTrigger><SelectValue placeholder="Seleccione un responsable" /></SelectTrigger>
                  <SelectContent>
                    {responsables?.map(r => (
                      <SelectItem key={r.id} value={r.id.toString()}>{r.nombre} - {r.cargo || 'Sin cargo'}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {responsableSeleccionado && (
                <div className="p-3 bg-muted/50 rounded-lg text-sm">
                  <p><strong>Nombre:</strong> {responsableSeleccionado.nombre}</p>
                  <p><strong>Cargo:</strong> {responsableSeleccionado.cargo || '-'}</p>
                  <p><strong>Dependencia:</strong> {dependencias?.find(d => d.id === responsableSeleccionado.dependenciaId)?.nombre || '-'}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  disabled={!selectedResponsable}
                  onClick={() => {
                    if (!responsableSeleccionado) return;
                    const bienesDelResponsable = bienesFiltrados
                      .filter(b => b.responsableId === responsableSeleccionado.id && b.activo)
                      .map(b => ({
                        ...b,
                        fechaAlta: b.fechaAlta?.toString() || '',
                      }));

                    setPreviewDoc(
                      <ActaResponsabilidadPDF
                        responsable={{
                          nombre: responsableSeleccionado.nombre,
                          cargo: responsableSeleccionado.cargo,
                          jerarquia: responsableSeleccionado.jerarquia,
                          dependenciaNombre: dependencias?.find(d => d.id === responsableSeleccionado.dependenciaId)?.nombre,
                        }}
                        bienes={bienesDelResponsable}
                        institucion={institucion || 'Institución'}
                        unidad={unidad || 'Unidad'}
                      />
                    );
                  }}
                  className="gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Vista Previa
                </Button>

                {responsableSeleccionado && (
                  <Button
                    variant="outline"
                    disabled={downloading !== null}
                    onClick={() => {
                      if (!responsableSeleccionado) return;
                      handleDownload(
                        <ActaResponsabilidadPDF
                          responsable={{
                            nombre: responsableSeleccionado.nombre,
                            cargo: responsableSeleccionado.cargo,
                            jerarquia: responsableSeleccionado.jerarquia,
                            dependenciaNombre: dependencias?.find(d => d.id === responsableSeleccionado.dependenciaId)?.nombre,
                          }}
                          bienes={bienesFiltrados
                            .filter(b => b.responsableId === responsableSeleccionado.id && b.activo)
                            .map(b => ({ ...b, fechaAlta: b.fechaAlta?.toString() || '' }))}
                          institucion={institucion || 'Institución'}
                          unidad={unidad || 'Unidad'}
                        />,
                        `SIGPIC_ActaResponsabilidad_${responsableSeleccionado.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`
                      );
                    }}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Descargar PDF
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── ACTA DE ENTREGA ────────────────────────────────────────────── */}
        <TabsContent value="acta-entrega" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Acta de Entrega / Recepción</CardTitle>
              <CardDescription>Documento para transferir la responsabilidad de bienes entre funcionarios.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center">
                  <User className="w-4 h-4 mr-1.5" />
                  Responsable que entrega
                </label>
                <Select
                  value={selectedEntregaResponsable}
                  onValueChange={(v) => {
                    setSelectedEntregaResponsable(v);
                    setSelectedBienes([]);
                    const resp = responsables?.find(r => r.id === parseInt(v));
                    if (resp) {
                      setEntregaNombre(resp.nombre);
                      setEntregaCargo(resp.cargo || '');
                    }
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Seleccione el responsable actual" /></SelectTrigger>
                  <SelectContent>
                    {responsables?.map(r => (
                      <SelectItem key={r.id} value={r.id.toString()}>
                        {r.nombre} - {r.cargo || 'Sin cargo'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedEntregaResponsable && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-muted-foreground flex items-center">
                      <Package className="w-4 h-4 mr-1.5" />
                      Bienes a transferir ({selectedBienes.length} de {bienesEntrega.length})
                    </label>
                    <Button variant="ghost" size="sm" onClick={toggleAllBienes} className="text-xs h-7">
                      {selectedBienes.length === bienesEntrega.length ? 'Limpiar' : 'Seleccionar todos'}
                    </Button>
                  </div>
                  <div className="border rounded-lg max-h-[300px] overflow-y-auto">
                    {bienesEntrega.length === 0 ? (
                      <div className="p-4 text-sm text-muted-foreground text-center">Este responsable no tiene bienes asignados</div>
                    ) : (
                      <div className="divide-y">
                        {bienesEntrega.map(b => (
                          <label
                            key={b.id}
                            className="flex items-center gap-3 px-3 py-2 hover:bg-muted/50 cursor-pointer text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={selectedBienes.includes(b.id.toString())}
                              onChange={() => toggleBien(b.id.toString())}
                              className="rounded border-gray-300"
                            />
                            <div className="flex-1 min-w-0">
                              <span className="font-medium">{b.nombre}</span>
                              <span className="text-muted-foreground ml-2">({b.codigoInterno || b.numeroPatrimonial || 'S/N'})</span>
                            </div>
                            <span className="text-xs text-muted-foreground shrink-0">{b.dependenciaNombre || '-'}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">ENTREGA</p>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Nombre completo</label>
                    <Input placeholder="Nombre de quien entrega" value={entregaNombre} onChange={(e) => setEntregaNombre(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Cargo</label>
                    <Input placeholder="Cargo de quien entrega" value={entregaCargo} onChange={(e) => setEntregaCargo(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm font-semibold text-green-700 dark:text-green-300">RECIBE</p>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Nombre completo</label>
                    <Input placeholder="Nombre de quien recibe" value={recibeNombre} onChange={(e) => setRecibeNombre(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Cargo</label>
                    <Input placeholder="Cargo de quien recibe" value={recibeCargo} onChange={(e) => setRecibeCargo(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  disabled={selectedBienes.length === 0}
                  onClick={() => {
                    if (bienesSeleccionados.length === 0) return;
                    setPreviewDoc(
                      <ActaEntregaPDF
                        bienes={bienesSeleccionados.map(b => ({
                          ...b,
                          fechaAlta: b.fechaAlta?.toString() || '',
                        }))}
                        responsableAnterior={entregaNombre || null}
                        institucion={institucion || 'Institución'}
                        unidad={unidad || 'Unidad'}
                        entregaNombre={entregaNombre || '________________________________'}
                        entregaCargo={entregaCargo || 'Cargo'}
                        recibeNombre={recibeNombre || '________________________________'}
                        recibeCargo={recibeCargo || 'Cargo'}
                      />
                    );
                  }}
                  className="gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Vista Previa
                </Button>

                {selectedBienes.length > 0 && (
                  <Button
                    variant="outline"
                    disabled={downloading !== null}
                    onClick={() => {
                      if (bienesSeleccionados.length === 0) return;
                      handleDownload(
                        <ActaEntregaPDF
                          bienes={bienesSeleccionados.map(b => ({
                            ...b,
                            fechaAlta: b.fechaAlta?.toString() || '',
                          }))}
                          responsableAnterior={entregaNombre || null}
                          institucion={institucion || 'Institución'}
                          unidad={unidad || 'Unidad'}
                          entregaNombre={entregaNombre || '________________________________'}
                          entregaCargo={entregaCargo || 'Cargo'}
                          recibeNombre={recibeNombre || '________________________________'}
                          recibeCargo={recibeCargo || 'Cargo'}
                        />,
                        `SIGPIC_ActaEntrega_${new Date().toISOString().slice(0, 10)}.pdf`
                      );
                    }}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Descargar PDF
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── ACTA DE BAJA ───────────────────────────────────────────────── */}
        <TabsContent value="acta-baja" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Acta de Baja Patrimonial</CardTitle>
              <CardDescription>Documento para registrar la baja definitiva de un bien del inventario.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center">
                  <Package className="w-4 h-4 mr-1.5" />
                  Bien a dar de baja
                </label>
                <Select value={selectedBien} onValueChange={setSelectedBien}>
                  <SelectTrigger><SelectValue placeholder="Seleccione un bien" /></SelectTrigger>
                  <SelectContent>
                    {bienesFiltrados.map(b => (
                      <SelectItem key={b.id} value={b.id.toString()}>
                        {b.nombre} ({b.codigoInterno || b.numeroPatrimonial || 'S/N'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {bienSeleccionado && (
                <div className="p-3 bg-muted/50 rounded-lg text-sm space-y-1">
                  <p><strong>Nombre:</strong> {bienSeleccionado.nombre}</p>
                  <p><strong>Código:</strong> {bienSeleccionado.codigoInterno || '-'}</p>
                  <p><strong>Estado:</strong> {bienSeleccionado.estadoFisico} / {bienSeleccionado.estadoAdministrativo}</p>
                  <p><strong>Responsable:</strong> {bienSeleccionado.responsableNombre || 'Sin asignar'}</p>
                </div>
              )}

              {bienSeleccionado && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div className="space-y-3 p-3 bg-muted/50 rounded-lg border">
                    <p className="text-sm font-semibold">FIRMANTE (Director)</p>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">Nombre completo</label>
                      <Input placeholder="Nombre del director" value={bajaFirmanteNombre} onChange={(e) => setBajaFirmanteNombre(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">Cargo</label>
                      <Input placeholder="Cargo del director" value={bajaFirmanteCargo} onChange={(e) => setBajaFirmanteCargo(e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  disabled={!selectedBien}
                  onClick={() => {
                    if (!bienSeleccionado) return;
                    const respCargo = responsables?.find(r => r.id === bienSeleccionado.responsableId)?.cargo || null;
                    setPreviewDoc(
                      <ActaBajaPDF
                        bien={{
                          ...bienSeleccionado,
                          fechaAlta: bienSeleccionado.fechaAlta?.toString() || '',
                          responsableCargo: respCargo,
                        }}
                        movimientos={movimientosBien}
                        institucion={institucion || 'Institución'}
                        unidad={unidad || 'Unidad'}
                        firmanteNombre={bajaFirmanteNombre || '________________________________'}
                        firmanteCargo={bajaFirmanteCargo || 'Cargo'}
                      />
                    );
                  }}
                  className="gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Vista Previa
                </Button>

                {bienSeleccionado && (
                  <Button
                    variant="outline"
                    disabled={downloading !== null}
                    onClick={() => {
                      if (!bienSeleccionado) return;
                      handleDownload(
                        <ActaBajaPDF
                          bien={{
                            ...bienSeleccionado,
                            fechaAlta: bienSeleccionado.fechaAlta?.toString() || '',
                            responsableCargo: responsables?.find(r => r.id === bienSeleccionado.responsableId)?.cargo || null,
                          }}
                          movimientos={movimientosBien}
                          institucion={institucion || 'Institución'}
                          unidad={unidad || 'Unidad'}
                          firmanteNombre={bajaFirmanteNombre || '________________________________'}
                          firmanteCargo={bajaFirmanteCargo || 'Cargo'}
                        />,
                        `SIGPIC_ActaBaja_${bienSeleccionado.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`
                      );
                    }}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Descargar PDF
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ─── PREVIEW MODAL ──────────────────────────────────────────────── */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Vista Previa del Documento</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPreviewDoc(null)}>
                  Cerrar
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <PDFViewer width="100%" height="100%" showToolbar={true}>
                {previewDoc}
              </PDFViewer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
