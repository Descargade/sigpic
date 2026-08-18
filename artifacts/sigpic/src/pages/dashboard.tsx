import React, { useMemo } from 'react';
import {
  useGetDashboardResumen,
  useGetDashboardUltimosMovimientos,
  useListBienes,
} from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Building2,
  Users,
  AlertTriangle,
  Activity,
  History,
  Package,
  BarChart3,
  MapPin,
  Tag,
  Truck,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#22c55e', '#3b82f6', '#eab308', '#f97316', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

const tooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
};

function ChartCard({ title, icon: Icon, children, className = '' }: { title: string; icon: any; children: React.ReactNode; className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base flex items-center">
          <Icon className="w-5 h-5 mr-2" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function BarChartSimple({ data, dataKey = 'cantidad', nameKey = 'nombre' }: { data: any[]; dataKey?: string; nameKey?: string }) {
  if (!data || data.length === 0) {
    return <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">No hay datos disponibles</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis dataKey={nameKey} tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey={dataKey} name="Cantidad" radius={[4, 4, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function groupBy(arr: any[], key: string) {
  const map = new Map<string, number>();
  arr.forEach(item => {
    const val = item[key] || 'Sin datos';
    map.set(val, (map.get(val) || 0) + 1);
  });
  return Array.from(map.entries())
    .map(([nombre, cantidad]) => ({ nombre, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad);
}

export default function Dashboard() {
  const { data: resumen, isLoading: isLoadingResumen } = useGetDashboardResumen();
  const { data: ultimosMovimientos, isLoading: isLoadingMovimientos } = useGetDashboardUltimosMovimientos();
  const { data: bienes } = useListBienes();

  const bienesPorEstadoFisico = resumen?.bienesPorEstadoFisico || [];
  const bienesPorEstadoAdmin = resumen?.bienesPorEstadoAdministrativo || [];

  const adminCounts = bienesPorEstadoAdmin.reduce((acc, item) => {
    acc[item.estado] = item.cantidad;
    return acc;
  }, {} as Record<string, number>);

  const kpiEnUso = (adminCounts['Activo'] || 0) + (adminCounts['Asignado'] || 0);
  const kpiEnReparacion = (adminCounts['En reparacion'] || 0) + (adminCounts['Deposito'] || 0);
  const kpiExtraviados = (adminCounts['Faltante'] || 0) + (adminCounts['Baja'] || 0);

  const chartCategoria = useMemo(() => groupBy(bienes || [], 'categoriaNombre'), [bienes]);
  const chartDependencia = useMemo(() => groupBy(bienes || [], 'dependenciaNombre'), [bienes]);
  const chartResponsable = useMemo(() => groupBy(bienes || [], 'responsableNombre').slice(0, 10), [bienes]);
  const chartOrigen = useMemo(() => groupBy(bienes || [], 'origenBien'), [bienes]);

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel Principal</h1>
        <p className="text-muted-foreground mt-1">Resumen del estado patrimonial institucional.</p>
      </div>

      {isLoadingResumen ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-1/3 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : resumen ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-600">En uso</CardTitle>
              <div className="h-4 w-4 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{kpiEnUso}</div>
              <p className="text-xs text-muted-foreground">Activos + Asignados</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-500">Reparación/Depósito</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">{kpiEnReparacion}</div>
              <p className="text-xs text-muted-foreground">En reparación + Depósito</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-500">Extraviados/Baja</CardTitle>
              <div className="h-4 w-4 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="h-3 w-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{kpiExtraviados}</div>
              <p className="text-xs text-muted-foreground">Faltantes + Baja</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-500">Con componentes</CardTitle>
              <Package className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{resumen.bienesConComponentes ?? 0}</div>
              <p className="text-xs text-muted-foreground">Bienes con componentes</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Bienes por Estado Físico" icon={Activity} className="lg:col-span-1">
          <BarChartSimple data={bienesPorEstadoFisico} nameKey="estado" />
        </ChartCard>

        <ChartCard title="Bienes por Estado Administrativo" icon={Package} className="lg:col-span-1">
          <BarChartSimple data={bienesPorEstadoAdmin} nameKey="estado" />
        </ChartCard>

        <ChartCard title="Distribución de Estados" icon={BarChart3} className="lg:col-span-1">
          <div className="grid grid-cols-2 gap-2 h-[250px]">
            <div>
              <h4 className="text-xs font-medium mb-1 text-muted-foreground">Físico</h4>
              {bienesPorEstadoFisico.length > 0 ? (
                <ResponsiveContainer width="100%" height={130}>
                  <PieChart>
                    <Pie data={bienesPorEstadoFisico} cx="50%" cy="50%" innerRadius={20} outerRadius={45} paddingAngle={2} dataKey="cantidad" nameKey="estado">
                      {bienesPorEstadoFisico.map((_: any, i: number) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[130px] flex items-center justify-center text-muted-foreground text-xs">Sin datos</div>
              )}
            </div>
            <div>
              <h4 className="text-xs font-medium mb-1 text-muted-foreground">Administrativo</h4>
              {bienesPorEstadoAdmin.length > 0 ? (
                <ResponsiveContainer width="100%" height={130}>
                  <PieChart>
                    <Pie data={bienesPorEstadoAdmin} cx="50%" cy="50%" innerRadius={20} outerRadius={45} paddingAngle={2} dataKey="cantidad" nameKey="estado">
                      {bienesPorEstadoAdmin.map((_: any, i: number) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[130px] flex items-center justify-center text-muted-foreground text-xs">Sin datos</div>
              )}
            </div>
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Bienes por Categoría" icon={Tag}>
          <BarChartSimple data={chartCategoria} />
        </ChartCard>

        <ChartCard title="Bienes por Dependencia" icon={MapPin}>
          <BarChartSimple data={chartDependencia} />
        </ChartCard>

        <ChartCard title="Top Responsables" icon={Users}>
          <BarChartSimple data={chartResponsable} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Bienes por Origen" icon={Truck}>
          <BarChartSimple data={chartOrigen} />
        </ChartCard>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <History className="w-5 h-5 mr-2" />
              Últimos Movimientos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingMovimientos ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                ))}
              </div>
            ) : ultimosMovimientos && ultimosMovimientos.length > 0 ? (
              <div className="space-y-3 max-h-[250px] overflow-y-auto">
                {ultimosMovimientos.map(mov => (
                  <div key={mov.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium">{mov.tipo}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(mov.fecha), "dd/MM HH:mm", { locale: es })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate" title={mov.bienNombre}>
                        {mov.bienCodigoInterno ? `[${mov.bienCodigoInterno}] ` : ''}{mov.bienNombre}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No hay movimientos recientes
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
