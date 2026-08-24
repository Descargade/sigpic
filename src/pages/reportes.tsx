import React, { useState, useCallback } from 'react';
import { pdf } from '@react-pdf/renderer';
import { 
  useListDependencias, 
  useListResponsables, 
  useListCategorias, 
  useListCatalogos,
  useListBienes,
  useListConfiguracion,
} from '@workspace/api-client-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  FileBarChart, Download, FileSpreadsheet, FilterX, Building2, User, 
  Package, Tag, Calendar, FileText, Clock, CheckCircle2 
} from 'lucide-react';
import { InventarioPDF } from '@/components/pdf/InventarioPDF';

function useConfigValue(clave: string): string {
  const { data: config } = useListConfiguracion();
  return config?.find(c => c.clave === clave)?.valor || '';
}

type ReportPreset = {
  id: string;
  nombre: string;
  descripcion: string;
  icon: React.ReactNode;
  filters: Record<string, string>;
};

export default function Reportes() {
  const [filters, setFilters] = useState({
    dependenciaId: '',
    responsableId: '',
    categoriaId: '',
    estadoFisico: '',
    estadoAdministrativo: '',
    origenBien: '',
    activo: '',
    fechaDesde: '',
    fechaHasta: '',
  });

  const { data: dependencias } = useListDependencias();
  const { data: responsables } = useListResponsables();
  const { data: categorias } = useListCategorias();
  const { data: estadosFisicos } = useListCatalogos({ tipo: 'estadoFisico', soloActivos: true });
  const { data: estadosAdministrativos } = useListCatalogos({ tipo: 'estadoAdministrativo', soloActivos: true });
  const { data: origenes } = useListCatalogos({ tipo: 'tipoAdquisicion', soloActivos: true });
  const { data: allBienes } = useListBienes({});

  const institucion = useConfigValue('institucion.nombre');
  const unidad = useConfigValue('institucion.unidad');

  const presets: ReportPreset[] = [
    {
      id: 'activo',
      nombre: 'Bienes Activos',
      descripcion: 'Todos los bienes con estado Activo',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
      filters: { estadoAdministrativo: 'Activo' },
    },
    {
      id: 'reparacion',
      nombre: 'En Reparación',
      descripcion: 'Bienes que requieren mantenimiento',
      icon: <Clock className="w-4 h-4 text-amber-500" />,
      filters: { estadoAdministrativo: 'En reparacion' },
    },
    {
      id: 'baja',
      nombre: 'Dados de Baja',
      descripcion: 'Bienes fuera del sistema',
      icon: <FileText className="w-4 h-4 text-red-500" />,
      filters: { estadoAdministrativo: 'Baja' },
    },
    {
      id: 'faltantes',
      nombre: 'Faltantes',
      descripcion: 'Bienes extraviados o sin ubicación',
      icon: <Package className="w-4 h-4 text-orange-500" />,
      filters: { estadoAdministrativo: 'Faltante' },
    },
  ];

  const buildExportUrl = () => {
    const params = new URLSearchParams();
    if (filters.dependenciaId && filters.dependenciaId !== '__all__') params.append('dependenciaId', filters.dependenciaId);
    if (filters.responsableId && filters.responsableId !== '__all__') params.append('responsableId', filters.responsableId);
    if (filters.categoriaId && filters.categoriaId !== '__all__') params.append('categoriaId', filters.categoriaId);
    if (filters.estadoFisico && filters.estadoFisico !== '__all__') params.append('estadoFisico', filters.estadoFisico);
    if (filters.estadoAdministrativo && filters.estadoAdministrativo !== '__all__') params.append('estadoAdministrativo', filters.estadoAdministrativo);
    if (filters.origenBien && filters.origenBien !== '__all__') params.append('origenBien', filters.origenBien);
    if (filters.activo && filters.activo !== '__all__') params.append('activo', filters.activo);
    if (filters.fechaDesde) params.append('fechaDesde', filters.fechaDesde);
    if (filters.fechaHasta) params.append('fechaHasta', filters.fechaHasta);
    
    const queryString = params.toString();
    return `/api/reportes/bienes${queryString ? `?${queryString}` : ''}`;
  };

  const handleExportExcel = async () => {
    const url = buildExportUrl();
    const fullUrl = `${import.meta.env.VITE_API_URL || ''}${url}`;
    try {
      const res = await fetch(fullUrl);
      if (!res.ok) throw new Error('Error al descargar');
      const blob = await res.blob();
      const disposition = res.headers.get('content-disposition');
      const filename = disposition?.match(/filename="?(.+?)"?$/)?.[1] || 'SIGPIC_Bienes.xlsx';
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      window.open(fullUrl, '_blank');
    }
  };

  const [downloadingPDF, setDownloadingPDF] = useState(false);

  const handleDownloadPDF = useCallback(async () => {
    setDownloadingPDF(true);
    try {
      const doc = buildPDF();
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SIGPIC_Reporte_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error generating PDF:', e);
    } finally {
      setDownloadingPDF(false);
    }
  }, [filters, allBienes, dependencias, responsables, categorias, estadosFisicos, estadosAdministrativos, origenes, institucion, unidad]);

  const clearFilters = () => {
    setFilters({
      dependenciaId: '',
      responsableId: '',
      categoriaId: '',
      estadoFisico: '',
      estadoAdministrativo: '',
      origenBien: '',
      activo: '',
      fechaDesde: '',
      fechaHasta: '',
    });
  };

  const applyPreset = (preset: ReportPreset) => {
    setFilters(f => ({
      ...f,
      ...preset.filters,
      dependenciaId: '',
      responsableId: '',
      categoriaId: '',
      estadoFisico: '',
      origenBien: '',
    }));
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '' && v !== '__all__');

  const getFilteredBienes = () => {
    if (!allBienes) return [];
    let filtered = allBienes.filter(b => !b.parentId);
    if (filters.dependenciaId && filters.dependenciaId !== '__all__') filtered = filtered.filter(b => b.dependenciaId === parseInt(filters.dependenciaId));
    if (filters.responsableId && filters.responsableId !== '__all__') filtered = filtered.filter(b => b.responsableId === parseInt(filters.responsableId));
    if (filters.categoriaId && filters.categoriaId !== '__all__') filtered = filtered.filter(b => b.categoriaId === parseInt(filters.categoriaId));
    if (filters.estadoFisico && filters.estadoFisico !== '__all__') filtered = filtered.filter(b => b.estadoFisico === filters.estadoFisico);
    if (filters.estadoAdministrativo && filters.estadoAdministrativo !== '__all__') filtered = filtered.filter(b => b.estadoAdministrativo === filters.estadoAdministrativo);
    if (filters.origenBien && filters.origenBien !== '__all__') filtered = filtered.filter(b => b.origenBien === filters.origenBien);
    if (filters.activo === 'true') filtered = filtered.filter(b => b.activo);
    if (filters.activo === 'false') filtered = filtered.filter(b => !b.activo);
    if (filters.fechaDesde) filtered = filtered.filter(b => b.fechaAlta && new Date(b.fechaAlta) >= new Date(filters.fechaDesde));
    if (filters.fechaHasta) filtered = filtered.filter(b => b.fechaAlta && new Date(b.fechaAlta) <= new Date(filters.fechaHasta));
    return filtered;
  };

  const filteredCount = getFilteredBienes().length;
  const totalCount = allBienes?.filter(b => !b.parentId).length || 0;

  const getFiltrosPDF = (): Record<string, string> => {
    const f: Record<string, string> = {};
    if (filters.dependenciaId && filters.dependenciaId !== '__all__') {
      const dep = dependencias?.find(d => d.id === parseInt(filters.dependenciaId));
      if (dep) f['Dependencia'] = dep.nombre;
    }
    if (filters.responsableId && filters.responsableId !== '__all__') {
      const resp = responsables?.find(r => r.id === parseInt(filters.responsableId));
      if (resp) f['Responsable'] = resp.nombre;
    }
    if (filters.categoriaId && filters.categoriaId !== '__all__') {
      const cat = categorias?.find(c => c.id === parseInt(filters.categoriaId));
      if (cat) f['Categoría'] = cat.nombre;
    }
    if (filters.estadoFisico && filters.estadoFisico !== '__all__') f['Estado Físico'] = filters.estadoFisico;
    if (filters.estadoAdministrativo && filters.estadoAdministrativo !== '__all__') f['Estado Administrativo'] = filters.estadoAdministrativo;
    if (filters.origenBien && filters.origenBien !== '__all__') f['Origen'] = filters.origenBien;
    if (filters.fechaDesde) f['Desde'] = filters.fechaDesde;
    if (filters.fechaHasta) f['Hasta'] = filters.fechaHasta;
    return f;
  };

  const buildPDF = () => {
    const bienes = getFilteredBienes().map(b => ({
      ...b,
      fechaAlta: b.fechaAlta?.toString() || '',
    }));
    const filtros = getFiltrosPDF();

    return (
      <InventarioPDF
        titulo="Reporte de Inventario"
        subtitulo={Object.keys(filtros).length > 0 ? `Filtrado por: ${Object.values(filtros).join(', ')}` : 'Listado completo del patrimonio'}
        bienes={bienes}
        filtros={filtros}
        institucion={institucion || 'Institución'}
        unidad={unidad || 'Unidad'}
      />
    );
  };

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes y Exportación</h1>
          <p className="text-muted-foreground mt-1">Genere informes patrimoniales con filtros personalizados.</p>
        </div>
        {hasActiveFilters && (
          <Badge variant="secondary" className="text-xs w-fit">
            {filteredCount} de {totalCount} bienes
          </Badge>
        )}
      </div>

      {/* ─── PRESETS RÁPIDOS ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-muted-foreground mr-2">Reportes rápidos:</span>
        {presets.map(preset => (
          <Button
            key={preset.id}
            variant="outline"
            size="sm"
            onClick={() => applyPreset(preset)}
            className="gap-1.5"
          >
            {preset.icon}
            {preset.nombre}
          </Button>
        ))}
      </div>

      {/* ─── FILTROS ──────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center">
              <FilterX className="w-5 h-5 mr-2" />
              Filtros de Exportación
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            )}
          </CardTitle>
          <CardDescription>Seleccione los criterios para generar el reporte.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center">
                <Building2 className="w-3.5 h-3.5 mr-1" />
                Dependencia
              </label>
              <Select value={filters.dependenciaId} onValueChange={(v) => setFilters(f => ({ ...f, dependenciaId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Todas</SelectItem>
                  {dependencias?.map(d => (
                    <SelectItem key={d.id} value={d.id.toString()}>{d.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center">
                <User className="w-3.5 h-3.5 mr-1" />
                Responsable
              </label>
              <Select value={filters.responsableId} onValueChange={(v) => setFilters(f => ({ ...f, responsableId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Todos</SelectItem>
                  {responsables?.map(r => (
                    <SelectItem key={r.id} value={r.id.toString()}>{r.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center">
                <Tag className="w-3.5 h-3.5 mr-1" />
                Categoría
              </label>
              <Select value={filters.categoriaId} onValueChange={(v) => setFilters(f => ({ ...f, categoriaId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Todas</SelectItem>
                  {categorias?.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center">
                <Package className="w-3.5 h-3.5 mr-1" />
                Estado Físico
              </label>
              <Select value={filters.estadoFisico} onValueChange={(v) => setFilters(f => ({ ...f, estadoFisico: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Todos</SelectItem>
                  {estadosFisicos?.map(e => (
                    <SelectItem key={e.id} value={e.nombre}>{e.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Estado Administrativo</label>
              <Select value={filters.estadoAdministrativo} onValueChange={(v) => setFilters(f => ({ ...f, estadoAdministrativo: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Todos</SelectItem>
                  {estadosAdministrativos?.map(e => (
                    <SelectItem key={e.id} value={e.nombre}>{e.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Origen del Bien</label>
              <Select value={filters.origenBien} onValueChange={(v) => setFilters(f => ({ ...f, origenBien: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Todos</SelectItem>
                  {origenes?.map(o => (
                    <SelectItem key={o.id} value={o.nombre}>{o.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Estado</label>
              <Select value={filters.activo} onValueChange={(v) => setFilters(f => ({ ...f, activo: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Todos</SelectItem>
                  <SelectItem value="true">Activos</SelectItem>
                  <SelectItem value="false">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1" />
                Fecha Desde
              </label>
              <Input
                type="date"
                value={filters.fechaDesde}
                onChange={(e) => setFilters(f => ({ ...f, fechaDesde: e.target.value }))}
              />
            </div>
          </div>

          {/* Date Hasta - full width row */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1" />
                Fecha Hasta
              </label>
              <Input
                type="date"
                value={filters.fechaHasta}
                onChange={(e) => setFilters(f => ({ ...f, fechaHasta: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── PREVIEW ──────────────────────────────────────────────────────── */}
      {hasActiveFilters && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileBarChart className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Vista previa del reporte</p>
                  <p className="text-xs text-muted-foreground">
                    Se exportarán <span className="font-bold text-primary">{filteredCount}</span> bienes
                    {filteredCount !== totalCount && ` de ${totalCount} totales`}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Limpiar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── EXPORT OPTIONS ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:border-green-500/50 transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <FileSpreadsheet className="w-5 h-5 mr-2 text-green-600" />
              Exportar a Excel
            </CardTitle>
            <CardDescription>Formato Microsoft Excel (.xlsx)</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground mb-4 space-y-1.5">
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-green-500" />
                Todos los campos del inventario
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-green-500" />
                Encabezados estilizados y filas alternadas
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-green-500" />
                Filtros aplicados como columnas
              </li>
            </ul>
            <Button onClick={handleExportExcel} className="w-full bg-green-600 hover:bg-green-700">
              <Download className="w-4 h-4 mr-2" />
              Descargar Excel
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:border-blue-500/50 transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <FileBarChart className="w-5 h-5 mr-2 text-blue-600" />
              Exportar a PDF
            </CardTitle>
            <CardDescription>Formato PDF institucional</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground mb-4 space-y-1.5">
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-blue-500" />
                Encabezado y pie de página institucional
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-blue-500" />
                Filtros aplicados como subtítulo
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-blue-500" />
                Formato profesional para impresión
              </li>
            </ul>
            <Button variant="outline" className="w-full border-blue-200 hover:bg-blue-50" onClick={handleDownloadPDF} disabled={downloadingPDF}>
              <Download className="w-4 h-4 mr-2" />
              {downloadingPDF ? 'Generando...' : 'Descargar PDF'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
