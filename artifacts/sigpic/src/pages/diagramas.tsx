import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  MarkerType,
  Background,
  Controls,
  type Node,
  type Edge,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  useListDependencias,
  useListBienes,
  useListConfiguracion,
} from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  Building2,
  Users,
  MapPin,
  Layers,
  Eye,
  Pencil,
  Expand,
  Shrink,
  Presentation,
  ArrowLeft,
  Maximize,
  ZoomIn,
  Undo2,
  Save,
  RotateCcw,
  EyeOff,
  Eye as EyeIcon,
  Trash2,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/* ═══════════════════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════════════════ */

const NODE_W = 260;
const H_GAP = 100;
const V_GAP = 16;

const NODE_H: Record<string, number> = {
  institucion: 72,
  edificio: 80,
  responsable: 68,
  dependencia: 140,
  grupo: 84,
};

const LEVEL_X: Record<string, number> = {
  institucion: 40,
  edificio: 40 + NODE_W + H_GAP,
  responsable: 40 + (NODE_W + H_GAP) * 2,
  dependencia: 40 + (NODE_W + H_GAP) * 3,
  grupo: 40 + (NODE_W + H_GAP) * 4,
};

const COLORS = {
  institucion: { bg: '#1e3a8a', text: 'white' },
  edificio: { bg: '#1e40af', text: 'white' },
  responsable: { bg: '#6d28d9', text: 'white' },
  dependencia: { bg: '#0e7490', text: 'white' },
  grupo: { bg: '#047857', text: 'white' },
  bien: { bg: '#059669', text: '#064e3b' },
};

const COLORS_DARK = {
  institucion: { bg: '#2563eb', text: 'white' },
  edificio: { bg: '#3b82f6', text: 'white' },
  responsable: { bg: '#8b5cf6', text: 'white' },
  dependencia: { bg: '#06b6d4', text: 'white' },
  grupo: { bg: '#10b981', text: 'white' },
  bien: { bg: '#34d399', text: '#064e3b' },
};

const EDGE_COLORS: Record<string, string> = {
  'institucion-edificio': '#4f46e5',
  'edificio-responsable': '#6366f1',
  'responsable-dependencia': '#0891b2',
  'dependencia-grupo': '#059669',
};

/* ═══════════════════════════════════════════════════════════════════════════
   PERSISTENCE
   ═══════════════════════════════════════════════════════════════════════════ */

interface DiagramState {
  positions: Record<string, { x: number; y: number }>;
  hiddenEdges: string[];
  expandedGroups: string[];
}

function loadDiagramState(key: string): DiagramState | null {
  try {
    const raw = localStorage.getItem(`sigpic-diagram-${key}`);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveDiagramState(key: string, state: DiagramState) {
  localStorage.setItem(`sigpic-diagram-${key}`, JSON.stringify(state));
}

function clearDiagramState(key: string) {
  localStorage.removeItem(`sigpic-diagram-${key}`);
}

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface TreeNode {
  id: string;
  type: string;
  data: Record<string, any>;
  children: TreeNode[];
}

interface GroupedBienes {
  key: string;
  label: string;
  bienes: any[];
  total: number;
}

/* ═══════════════════════════════════════════════════════════════════════════
   UTILITY FUNCTIONS
   ═══════════════════════════════════════════════════════════════════════════ */

function getColors(isDark: boolean) {
  return isDark ? COLORS_DARK : COLORS;
}

function groupBienes(bienes: any[]): GroupedBienes[] {
  const map = new Map<string, GroupedBienes>();
  for (const b of bienes) {
    const cat = b.categoriaNombre || 'Sin categoría';
    const marca = b.marca || '';
    const modelo = b.modelo || '';
    const key = `${cat}|${marca}|${modelo}`;
    if (!map.has(key)) {
      map.set(key, {
        key,
        label: [cat, marca, modelo].filter(Boolean).join(' — ') || 'Sin categoría',
        bienes: [],
        total: 0,
      });
    }
    const g = map.get(key)!;
    g.bienes.push(b);
    g.total++;
  }
  return Array.from(map.values()).sort((a, b) => b.total - a.total);
}

function buildTree(dependencias: any[], bienes: any[]): TreeNode[] {
  const edificioMap = new Map<string, any[]>();
  for (const dep of dependencias) {
    const ed = dep.edificio || 'Sin Edificio';
    if (!edificioMap.has(ed)) edificioMap.set(ed, []);
    edificioMap.get(ed)!.push(dep);
  }

  const tree: TreeNode[] = [];
  const edificioNames = Array.from(edificioMap.keys()).sort();

  for (const edName of edificioNames) {
    const edDeps = edificioMap.get(edName)!;
    const edBienes = bienes.filter(b => edDeps.some((d: any) => d.id === b.dependenciaId));
    const respMap = new Map<string, any[]>();

    for (const dep of edDeps) {
      const rKey = dep.responsableId ? String(dep.responsableId) : '__none__';
      if (!respMap.has(rKey)) respMap.set(rKey, []);
      respMap.get(rKey)!.push(dep);
    }

    const respNodes: TreeNode[] = [];
    for (const [rKey, rDeps] of respMap) {
      const rName = rDeps[0].responsableNombre || 'Sin Responsable';
      const rCargos = [...new Set(rDeps.map((d: any) => d.responsableCargo).filter(Boolean))];

      const depNodes: TreeNode[] = rDeps.map(dep => {
        const depBienes = bienes.filter(b => b.dependenciaId === dep.id && !b.parentId);
        const groups = groupBienes(depBienes);
        const grupoNodes: TreeNode[] = groups.map(grupo => ({
          id: `grupo-${dep.id}-${grupo.key}`,
          type: 'grupo',
          data: {
            label: grupo.label,
            total: grupo.total,
            bienes: grupo.bienes,
            dependenciaId: dep.id,
          },
          children: [],
        }));

        return {
          id: `dep-${dep.id}`,
          type: 'dependencia',
          data: {
            label: dep.nombre,
            edificio: dep.edificio || 'Sin Edificio',
            piso: dep.piso || 'Sin Piso',
            responsable: rName,
            bienesCount: depBienes.length,
            ubicacion: dep.ubicacion,
            grupos: groups.map(g => `${g.label} — ${g.total}`),
          },
          children: grupoNodes,
        };
      });

      respNodes.push({
        id: `resp-${edName}-${rKey}`,
        type: 'responsable',
        data: {
          label: rName,
          cargo: rCargos.join(', ') || undefined,
          dependenciasCount: rDeps.length,
          edificio: edName,
        },
        children: depNodes,
      });
    }

    tree.push({
      id: `edificio-${edName}`,
      type: 'edificio',
      data: {
        label: edName,
        responsablesCount: respNodes.length,
        dependenciasCount: edDeps.length,
        bienesCount: edBienes.length,
        responsables: respNodes.map(r => r.data.label),
      },
      children: respNodes,
    });
  }

  return tree;
}

/* ═══════════════════════════════════════════════════════════════════════════
   LAYOUT ENGINE
   ═══════════════════════════════════════════════════════════════════════════ */

function getSubtreeHeight(node: TreeNode): number {
  const h = NODE_H[node.type] || 60;
  if (node.children.length === 0) return h;
  const childTotal = node.children.reduce((sum, c) => sum + getSubtreeHeight(c), 0) + (node.children.length - 1) * V_GAP;
  return Math.max(h, childTotal);
}

function positionSubtree(
  node: TreeNode, x: number, yCenter: number,
  nodes: Node[], edges: Edge[], parentId?: string, parentType?: string
) {
  const h = NODE_H[node.type] || 60;
  nodes.push({
    id: node.id,
    type: node.type,
    position: { x, y: yCenter - h / 2 },
    data: node.data,
  });

  if (parentId) {
    const edgeKey = `${parentType}-${node.type}`;
    const stroke = EDGE_COLORS[edgeKey] || '#94a3b8';
    edges.push({
      id: `e-${parentId}-${node.id}`,
      source: parentId,
      target: node.id,
      type: 'smoothstep',
      animated: true,
      style: { stroke, strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: stroke, width: 12, height: 12 },
    });
  }

  if (node.children.length === 0) return;

  const childHeights = node.children.map(getSubtreeHeight);
  const totalChildH = childHeights.reduce((a, b) => a + b, 0) + (node.children.length - 1) * V_GAP;
  let childY = yCenter - totalChildH / 2;

  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    const childH = childHeights[i];
    const childCenter = childY + childH / 2;
    positionSubtree(child, x + NODE_W + H_GAP, childCenter, nodes, edges, node.id, node.type);
    childY += childH + V_GAP;
  }
}

function computeLayout(dependencias: any[], bienes: any[]): { nodes: Node[]; edges: Edge[] } {
  const tree = buildTree(dependencias, bienes);
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const totalH = tree.reduce((sum, t) => sum + getSubtreeHeight(t), 0) + (tree.length - 1) * V_GAP * 2;
  let y = totalH / 2;

  nodes.push({
    id: 'institucion',
    type: 'institucion',
    position: { x: LEVEL_X.institucion, y: 0 },
    data: { label: 'Instituto', total: dependencias.length, bienesCount: bienes.length },
  });

  const instH = Math.max(totalH, 100);

  for (const ed of tree) {
    const h = getSubtreeHeight(ed);
    const edCenter = y + h / 2;

    edges.push({
      id: `e-inst-${ed.id}`,
      source: 'institucion',
      target: ed.id,
      type: 'smoothstep',
      animated: true,
      style: { stroke: EDGE_COLORS['institucion-edificio'], strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_COLORS['institucion-edificio'], width: 12, height: 12 },
    });

    positionSubtree(ed, LEVEL_X.edificio, edCenter, nodes, edges);
    y += h + V_GAP * 2;
  }

  nodes[0].position.y = instH / 2 - NODE_H.institucion / 2;

  return { nodes, edges };
}

/* ═══════════════════════════════════════════════════════════════════════════
   NODE COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */

function NodeShell({ color, icon: Icon, label, sub, badges, children, tooltip }: {
  color: string; icon: any; label: string; sub?: string;
  badges?: React.ReactNode; children?: React.ReactNode; tooltip?: string;
}) {
  return (
    <div title={tooltip} className="drag-handle">
      <Handle type="target" position={Position.Left} className="!w-2.5 !h-2.5 !-left-1.5" style={{ background: color }} />
      <div className="rounded-xl shadow-lg border border-black/5 transition-all hover:shadow-xl" style={{ background: color, width: NODE_W }}>
        <div className="flex items-center gap-2 px-3 py-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-white text-xs truncate leading-tight">{label}</div>
            {sub && <div className="text-[10px] text-white/70 truncate leading-tight mt-0.5">{sub}</div>}
          </div>
          {badges}
        </div>
        {children}
      </div>
      <Handle type="source" position={Position.Right} className="!w-2.5 !h-2.5 !-right-1.5" style={{ background: color }} />
    </div>
  );
}

function InstitucionNode({ data }: { data: any }) {
  return (
    <NodeShell color={COLORS.institucion.bg} icon={Building2} label={data.label} sub={`${data.total} dependencias · ${data.bienesCount} bienes`}>
      <div className="px-3 pb-2.5 flex gap-1.5">
        <Badge variant="secondary" className="bg-white/20 text-white border-0 text-[9px]">{data.total} deps</Badge>
        <Badge variant="secondary" className="bg-white/20 text-white border-0 text-[9px]">{data.bienesCount} bienes</Badge>
      </div>
    </NodeShell>
  );
}

function EdificioNode({ data }: { data: any }) {
  return (
    <NodeShell color={COLORS.edificio.bg} icon={Building2} label={data.label}
      sub={`${data.responsablesCount} responsables · ${data.dependenciasCount} dependencias`}
      badges={<Badge variant="secondary" className="bg-white/20 text-white border-0 text-[10px] shrink-0">{data.bienesCount} b</Badge>}
    >
      <div className="px-3 pb-2 flex flex-wrap gap-1">
        {data.responsables?.slice(0, 3).map((r: string, i: number) => (
          <Badge key={i} variant="secondary" className="bg-white/15 text-white/80 border-0 text-[8px] truncate max-w-[100px]">{r}</Badge>
        ))}
        {data.responsables?.length > 3 && <Badge variant="secondary" className="bg-white/15 text-white/80 border-0 text-[8px]">+{data.responsables.length - 3}</Badge>}
      </div>
    </NodeShell>
  );
}

function ResponsableNode({ data }: { data: any }) {
  return (
    <NodeShell color={COLORS.responsable.bg} icon={Users} label={data.label}
      sub={data.cargo || `Edificio: ${data.edificio}`}
      badges={<Badge variant="secondary" className="bg-white/20 text-white border-0 text-[10px] shrink-0">{data.dependenciasCount} d</Badge>}
    />
  );
}

function DependenciaNode({ data }: { data: any }) {
  const grupos = (data.grupos || []).slice(0, 3);

  return (
    <div title={`${data.label}\nEdificio: ${data.edificio}\nPiso: ${data.piso}\nResponsable: ${data.responsable}\nBienes: ${data.bienesCount}`} className="drag-handle">
      <Handle type="target" position={Position.Left} className="!w-2.5 !h-2.5 !-left-1.5" style={{ background: COLORS.dependencia.bg }} />
      <div className="rounded-xl shadow-lg border border-black/5 transition-all hover:shadow-xl" style={{ background: COLORS.dependencia.bg, width: NODE_W }}>
        <div className="flex items-center gap-2 px-3 py-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-white text-xs truncate leading-tight">{data.label}</div>
            <div className="text-[10px] text-white/70 leading-tight mt-0.5 truncate">{data.edificio} · {data.piso}</div>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white border-0 text-[10px] shrink-0">{data.bienesCount} b</Badge>
        </div>
        <div className="px-3 pb-2 space-y-0.5">
          <div className="flex items-center gap-1 text-[9px] text-white/70">
            <Users className="w-2.5 h-2.5 shrink-0" />
            <span className="truncate">{data.responsable}</span>
          </div>
          {data.ubicacion && (
            <div className="flex items-center gap-1 text-[9px] text-white/60">
              <MapPin className="w-2.5 h-2.5 shrink-0" />
              <span className="truncate">{data.ubicacion}</span>
            </div>
          )}
          {grupos.length > 0 && (
            <div className="pt-1 border-t border-white/10 space-y-0.5">
              {grupos.map((g: string, i: number) => (
                <div key={i} className="text-[8px] text-white/60 truncate">{g}</div>
              ))}
              {(data.grupos?.length || 0) > 3 && (
                <div className="text-[8px] text-white/50">+{data.grupos.length - 3} más</div>
              )}
            </div>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!w-2.5 !h-2.5 !-right-1.5" style={{ background: COLORS.dependencia.bg }} />
    </div>
  );
}

function GrupoNode({ data, id }: { data: any; id: string }) {
  const bienes = data.bienes || [];
  const expanded = data.expanded || false;

  return (
    <div title={`${data.label}\n${data.total} unidades`}>
      <Handle type="target" position={Position.Left} className="!w-2.5 !h-2.5 !-left-1.5" style={{ background: COLORS.grupo.bg }} />
      <div className="rounded-xl shadow-lg border border-black/5 transition-all hover:shadow-xl" style={{ background: COLORS.grupo.bg, width: NODE_W }}>
        <div
          className="w-full flex items-center gap-2 px-3 py-2.5 cursor-pointer select-none text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-white text-xs truncate leading-tight">{data.label}</div>
            <div className="text-[10px] text-white/70 leading-tight mt-0.5">{data.total} unidades</div>
          </div>
          <div className="text-white/60">
            {expanded ? <Shrink className="w-3.5 h-3.5" /> : <Expand className="w-3.5 h-3.5" />}
          </div>
        </div>
        {expanded && bienes.length > 0 && (
          <div className="px-3 pb-2 border-t border-white/10 pt-1.5 max-h-[240px] overflow-y-auto">
            <div className="space-y-0">
              {bienes.map((b: any) => (
                <div key={b.id}
                  className="flex items-center text-[9px] text-white/80 hover:text-white cursor-pointer group/item py-0.5"
                  onPointerDown={(e) => { e.stopPropagation(); }}
                  onClick={(e) => { e.stopPropagation(); window.location.href = `/bienes/${b.id}`; }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40 shrink-0 mr-1.5" />
                  <span className="truncate flex-1">{b.codigoInterno || b.nombre}</span>
                  <span className="text-white/50 text-[8px] ml-1 shrink-0">Cant: {b.cantidad || 1}</span>
                  <Eye className="w-2.5 h-2.5 ml-1 opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} className="!w-2.5 !h-2.5 !-right-1.5" style={{ background: COLORS.grupo.bg }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   LEGEND
   ═══════════════════════════════════════════════════════════════════════════ */

function DiagramLegend({ show }: { show: boolean }) {
  if (!show) return null;
  const items = [
    { color: COLORS.institucion.bg, label: 'Instituto' },
    { color: COLORS.edificio.bg, label: 'Edificio' },
    { color: COLORS.responsable.bg, label: 'Responsable' },
    { color: COLORS.dependencia.bg, label: 'Dependencia' },
    { color: COLORS.grupo.bg, label: 'Grupo de Bienes' },
  ];
  return (
    <div className="absolute bottom-4 left-4 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur rounded-lg shadow-lg border p-3">
      <div className="text-xs font-semibold mb-2 text-muted-foreground">Leyenda</div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {items.map(item => (
          <div key={item.label} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: item.color }} />
            <span className="text-[11px] text-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   DIAGRAM INNER (ReactFlow canvas + all controls)
   ═══════════════════════════════════════════════════════════════════════════ */

function DiagramInner({
  initialNodes, initialEdges, isLoading, bgClass, downloadLabel, showLegend,
  diagramKey, editMode, setEditMode,
}: {
  initialNodes: Node[]; initialEdges: Edge[]; isLoading: boolean; bgClass: string;
  downloadLabel?: string; showLegend?: boolean; diagramKey: string;
  editMode: boolean; setEditMode: (v: boolean) => void;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const { fitView, zoomIn, zoomOut, getNodes, getEdges, setNodes: rfSetNodes, setEdges: rfSetEdges } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [hiddenEdges, setHiddenEdges] = useState<Set<string>>(new Set());
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [saved, setSaved] = useState<DiagramState | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Merge expanded state into nodes (MUST be before effects that use it)
  const toggleGroup = useCallback((nodeId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  }, []);

  const nodesWithExpanded = useMemo(() =>
    nodes.map(n => {
      if (n.type === 'grupo') {
        return {
          ...n,
          data: { ...n.data, expanded: expandedGroups.has(n.id), __onToggle: toggleGroup },
        };
      }
      return n;
    }),
    [nodes, expandedGroups, toggleGroup]
  );

  // Load saved state
  useEffect(() => {
    const state = loadDiagramState(diagramKey);
    if (state) {
      setSaved(state);
      setHiddenEdges(new Set(state.hiddenEdges));
      setExpandedGroups(new Set(state.expandedGroups || []));
      setNodes(nds => nds.map(n => {
        const pos = state.positions[n.id];
        return pos ? { ...n, position: pos } : n;
      }));
    }
  }, [diagramKey]); // eslint-disable-line

  // Track changes
  useEffect(() => {
    const currentPositions: Record<string, { x: number; y: number }> = {};
    for (const n of nodesWithExpanded) {
      currentPositions[n.id] = n.position;
    }
    if (!saved) {
      setHasChanges(Object.keys(currentPositions).length > 0);
      return;
    }
    const posChanged = JSON.stringify(currentPositions) !== JSON.stringify(saved.positions);
    const edgeChanged = hiddenEdges.size !== saved.hiddenEdges.length ||
      [...hiddenEdges].some(e => !saved.hiddenEdges.includes(e));
    const expandedChanged = expandedGroups.size !== (saved.expandedGroups?.length || 0) ||
      [...expandedGroups].some(e => !(saved.expandedGroups || []).includes(e));
    setHasChanges(posChanged || edgeChanged || expandedChanged);
  }, [nodesWithExpanded, hiddenEdges, expandedGroups, saved]);

  // Sync initial data when not in edit mode
  useEffect(() => {
    if (!editMode) {
      setNodes(initialNodes);
      setEdges(initialEdges);
      if (saved) {
        setNodes(nds => nds.map(n => {
          const pos = saved.positions[n.id];
          return pos ? { ...n, position: pos } : n;
        }));
      }
    }
  }, [initialNodes, initialEdges]); // eslint-disable-line

  // Filter hidden edges
  const visibleEdges = useMemo(() =>
    edges.filter(e => !hiddenEdges.has(e.id)),
    [edges, hiddenEdges]
  );

  const handleSave = useCallback(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    for (const n of nodesWithExpanded) {
      positions[n.id] = n.position;
    }
    const state: DiagramState = {
      positions,
      hiddenEdges: [...hiddenEdges],
      expandedGroups: [...expandedGroups],
    };
    saveDiagramState(diagramKey, state);
    setSaved(state);
    setHasChanges(false);
  }, [nodesWithExpanded, hiddenEdges, diagramKey]);

  const handleReset = useCallback(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setHiddenEdges(new Set());
    setSelectedEdge(null);
    clearDiagramState(diagramKey);
    setSaved(null);
    setHasChanges(false);
  }, [initialNodes, initialEdges, diagramKey]);

  const handleRestoreConnections = useCallback(() => {
    setHiddenEdges(new Set());
    setSelectedEdge(null);
    setHasChanges(true);
  }, []);

  const handleHideEdge = useCallback((edgeId: string) => {
    setHiddenEdges(prev => {
      const next = new Set(prev);
      next.add(edgeId);
      return next;
    });
    setSelectedEdge(null);
    setHasChanges(true);
  }, []);

  const handleShowEdge = useCallback((edgeId: string) => {
    setHiddenEdges(prev => {
      const next = new Set(prev);
      next.delete(edgeId);
      return next;
    });
    setHasChanges(true);
  }, []);

  const handleDownload = useCallback(async () => {
    if (!wrapperRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(wrapperRef.current, {
        backgroundColor: '#ffffff',
        pixelRatio: 4,
        quality: 1,
        cacheBust: true,
        filter: (node: any) => {
          if (node.classList?.contains('react-flow__controls')) return false;
          if (node.classList?.contains('react-flow__minimap')) return false;
          if (node.classList?.contains('react-flow__attribution')) return false;
          return true;
        },
      });
      const link = document.createElement('a');
      link.download = `${downloadLabel || 'diagrama'}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading diagram:', err);
    } finally {
      setDownloading(false);
    }
  }, [downloadLabel]);

  const onEdgeClick = useCallback((_: any, edge: Edge) => {
    if (editMode) {
      setSelectedEdge(selectedEdge === edge.id ? null : edge.id);
    }
  }, [editMode, selectedEdge]);

  const onNodeClick = useCallback((_: any, node: Node) => {
    if (node.type === 'grupo') {
      toggleGroup(node.id);
    }
  }, [toggleGroup]);

  const onConnect = useCallback((connection: any) => {
    setEdges(eds => {
      const newEdge = {
        ...connection,
        id: `e-custom-${Date.now()}`,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#94a3b8', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8', width: 12, height: 12 },
      };
      return [...eds, newEdge as Edge];
    });
    setHasChanges(true);
  }, [setEdges]);

  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;

  return (
    <div className="relative flex flex-col">
      {/* Top-right controls */}
      <div className="absolute top-3 right-3 z-10 flex gap-2 flex-wrap justify-end">
        <Button size="sm" variant="outline" className="bg-background/90 backdrop-blur shadow-md border text-xs"
          onClick={() => fitView({ padding: 0.15 })}>
          <Maximize className="w-3.5 h-3.5 mr-1" />
          Encajar
        </Button>
        <Button size="sm" variant="outline" className="bg-background/90 backdrop-blur shadow-md border text-xs"
          onClick={handleDownload} disabled={downloading}>
          <Download className="w-3.5 h-3.5 mr-1" />
          {downloading ? 'Descargando...' : 'PNG'}
        </Button>

        {editMode ? (
          <>
            <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700 text-white text-xs"
              onClick={handleSave} disabled={!hasChanges}>
              <Save className="w-3.5 h-3.5 mr-1" />
              Guardar
            </Button>
            <Button size="sm" variant="outline" className="bg-background/90 backdrop-blur shadow-md border text-xs"
              onClick={handleReset}>
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Restablecer
            </Button>
            {hiddenEdges.size > 0 && (
              <Button size="sm" variant="outline" className="bg-background/90 backdrop-blur shadow-md border text-xs"
                onClick={handleRestoreConnections}>
                <EyeIcon className="w-3.5 h-3.5 mr-1" />
                Restaurar conexiones ({hiddenEdges.size})
              </Button>
            )}
            <Button size="sm" variant="destructive" className="text-xs"
              onClick={() => setEditMode(false)}>
              <X className="w-3.5 h-3.5 mr-1" />
              Salir edición
            </Button>
          </>
        ) : (
          <Button size="sm" variant="outline" className="bg-background/90 backdrop-blur shadow-md border text-xs"
            onClick={() => setEditMode(true)}>
            <Pencil className="w-3.5 h-3.5 mr-1" />
            Editar
          </Button>
        )}
      </div>

      {/* Unsaved changes indicator */}
      {hasChanges && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 bg-amber-500 text-white text-xs px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5" />
          Cambios sin guardar
        </div>
      )}

      {/* Edit mode indicator */}
      {editMode && (
        <div className="absolute top-3 left-3 z-10 bg-blue-600 text-white text-xs px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
          <Pencil className="w-3.5 h-3.5" />
          Modo edición
        </div>
      )}

      {/* Selected edge actions */}
      {selectedEdge && editMode && (
        <div className="absolute top-12 left-3 z-10 bg-white dark:bg-gray-900 shadow-lg border rounded-lg p-2 flex gap-2">
          <Button size="sm" variant="ghost" className="h-7 text-xs"
            onClick={() => handleHideEdge(selectedEdge)}>
            <EyeOff className="w-3.5 h-3.5 mr-1" />
            Ocultar
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-xs"
            onClick={() => setSelectedEdge(null)}>
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}

      {/* Canvas */}
      <div ref={wrapperRef} className={`h-[650px] max-w-[500px] border rounded-xl shadow-inner ${bgClass}`}>
        <ReactFlow
          nodes={nodesWithExpanded}
          edges={visibleEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onEdgeClick={onEdgeClick}
          onNodeClick={onNodeClick}
          onConnect={editMode ? onConnect : undefined}
          nodeTypes={{
            institucion: InstitucionNode,
            edificio: EdificioNode,
            responsable: ResponsableNode,
            dependencia: DependenciaNode,
            grupo: GrupoNode,
          }}
          defaultEdgeOptions={{ type: 'smoothstep', animated: true }}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          attributionPosition="bottom-left"
          proOptions={{ hideAttribution: true }}
          minZoom={0.1}
          maxZoom={2}
          nodesDraggable={editMode}
          nodesConnectable={editMode}
          edgesUpdatable={editMode}
          elementsSelectable
          selectionOnDrag={false}
          selectNodesOnDrag={false}
        >
          <Controls className="!bg-white !shadow-md !rounded-xl !border dark:!bg-gray-900" />
          <Background gap={24} size={1} />
        </ReactFlow>
      </div>

      <DiagramLegend show={showLegend !== false} />
    </div>
  );
}

function DiagramWrapper({
  initialNodes, initialEdges, isLoading, bgClass, downloadLabel, showLegend,
  diagramKey, editMode, setEditMode,
}: {
  initialNodes: Node[]; initialEdges: Edge[]; isLoading: boolean; bgClass: string;
  downloadLabel?: string; showLegend?: boolean; diagramKey: string;
  editMode: boolean; setEditMode: (v: boolean) => void;
}) {
  return (
    <ReactFlowProvider>
      <DiagramInner
        initialNodes={initialNodes} initialEdges={initialEdges}
        isLoading={isLoading} bgClass={bgClass} downloadLabel={downloadLabel}
        showLegend={showLegend} diagramKey={diagramKey}
        editMode={editMode} setEditMode={setEditMode}
      />
    </ReactFlowProvider>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

export default function Diagramas() {
  const [mode, setMode] = useState<'institucional' | 'patrimonial' | 'tecnico'>('institucional');
  const [presentation, setPresentation] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const tabs = [
    { key: 'institucional', label: 'Organizacional', icon: Building2 },
    { key: 'patrimonial', label: 'Patrimonial', icon: Layers },
    { key: 'tecnico', label: 'Técnico', icon: Users },
  ] as const;

  if (presentation) {
    return (
      <div className={`fixed inset-0 z-50 flex flex-col p-6 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="text-center flex-1">
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>SIGPIC — Diagrama Institucional</h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-muted-foreground'}`}>
              Generado el {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: es })}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setPresentation(false)}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Salir
          </Button>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          <DiagramaInstitucional showLegend diagramKey="institucional-presentation" editMode={false} setEditMode={() => {}} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Diagramas</h1>
          <p className="text-muted-foreground mt-1">Vista visual de la estructura institucional y distribución patrimonial.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPresentation(true)}>
            <Presentation className="w-4 h-4 mr-1" /> Presentación
          </Button>
        </div>
      </div>

      <div className="flex gap-2 border-b pb-2 px-4 shrink-0">
        {tabs.map(t => (
          <Button
            key={t.key}
            variant={mode === t.key ? 'default' : 'ghost'}
            size="sm"
            onClick={() => { setMode(t.key); setEditMode(false); }}
            className="gap-1.5"
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </Button>
        ))}
      </div>

      <div className="px-4 pb-4 flex justify-center">
        {mode === 'institucional' && <DiagramaInstitucional diagramKey="institucional" editMode={editMode} setEditMode={setEditMode} />}
        {mode === 'patrimonial' && <DiagramaPatrimonial diagramKey="patrimonial" editMode={editMode} setEditMode={setEditMode} />}
        {mode === 'tecnico' && <DiagramaTecnico diagramKey="tecnico" editMode={editMode} setEditMode={setEditMode} />}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   DIAGRAMA INSTITUCIONAL
   ═══════════════════════════════════════════════════════════════════════════ */

function DiagramaInstitucional({ showLegend, diagramKey, editMode, setEditMode }: {
  showLegend?: boolean; diagramKey: string; editMode: boolean; setEditMode: (v: boolean) => void;
}) {
  const { data: dependencias } = useListDependencias();
  const { data: bienes } = useListBienes({ soloRaiz: true });
  const { data: configuracion } = useListConfiguracion();

  const instName = configuracion?.find((c: any) => c.clave === 'institucion.nombre')?.valor || 'Instituto';

  const { nodes: layoutNodes, edges: layoutEdges } = useMemo(() => {
    if (!dependencias || !bienes) return { nodes: [], edges: [] };
    return computeLayout(dependencias, bienes);
  }, [dependencias, bienes]);

  const isLoading = !dependencias || !bienes;

  return (
    <div className="flex flex-col">
      <div className="mb-2 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-lg font-bold">{instName} — Diagrama Organizacional</h2>
          <p className="text-sm text-muted-foreground">Estructura institucional, edificios, responsables y dependencias.</p>
        </div>
        <Badge variant="outline" className="text-xs">{dependencias?.length || 0} dependencias · {bienes?.length || 0} bienes</Badge>
      </div>
      <DiagramWrapper
        initialNodes={layoutNodes} initialEdges={layoutEdges}
        isLoading={isLoading} bgClass="bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-gray-900 dark:to-blue-950/30"
        downloadLabel="diagrama-institucional" showLegend={showLegend}
        diagramKey={diagramKey} editMode={editMode} setEditMode={setEditMode}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   DIAGRAMA PATRIMONIAL
   ═══════════════════════════════════════════════════════════════════════════ */

function DiagramaPatrimonial({ showLegend, diagramKey, editMode, setEditMode }: {
  showLegend?: boolean; diagramKey: string; editMode: boolean; setEditMode: (v: boolean) => void;
}) {
  const { data: dependencias } = useListDependencias();
  const { data: bienes } = useListBienes({});

  const { nodes: layoutNodes, edges: layoutEdges } = useMemo(() => {
    if (!dependencias || !bienes) return { nodes: [], edges: [] };

    const depNodes: Node[] = [];
    const grupoNodes: Node[] = [];
    const grupoEdges: Edge[] = [];

    let y = 0;

    for (const dep of dependencias) {
      const depBienes = bienes.filter((b: any) => b.dependenciaId === dep.id && !b.parentId);
      const groups = groupBienes(depBienes);

      depNodes.push({
        id: `dep-${dep.id}`, type: 'dependencia',
        position: { x: 40, y },
        data: {
          label: dep.nombre,
          edificio: dep.edificio || 'Sin Edificio',
          piso: dep.piso || 'Sin Piso',
          responsable: dep.responsableNombre || 'Sin Responsable',
          bienesCount: depBienes.length,
          ubicacion: dep.ubicacion,
          grupos: groups.map(g => `${g.label} — ${g.total}`),
        },
      });

      const grupoY = y;
      for (let j = 0; j < groups.length; j++) {
        const grupo = groups[j];
        const grupoH = NODE_H.grupo;
        const gy = grupoY + j * (grupoH + V_GAP);

        const gNode: Node = {
          id: `grupo-${dep.id}-${grupo.key}`, type: 'grupo',
          position: { x: 40 + NODE_W + H_GAP, y: gy },
          data: { label: grupo.label, total: grupo.total, bienes: grupo.bienes, dependenciaId: dep.id },
        };
        grupoNodes.push(gNode);
        grupoEdges.push({
          id: `e-${dep.id}-${gNode.id}`, source: `dep-${dep.id}`, target: gNode.id,
          type: 'smoothstep', animated: true,
          style: { stroke: EDGE_COLORS['dependencia-grupo'], strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_COLORS['dependencia-grupo'], width: 12, height: 12 },
        });
      }

      const depH = Math.max(NODE_H.dependencia, groups.length * (NODE_H.grupo + V_GAP));
      y += depH + V_GAP * 2;
    }

    return { nodes: [...depNodes, ...grupoNodes], edges: grupoEdges };
  }, [dependencias, bienes]);

  const isLoading = !dependencias || !bienes;

  return (
    <div className="flex flex-col">
      <div className="mb-2 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-lg font-bold">Distribución Patrimonial</h2>
          <p className="text-sm text-muted-foreground">Dependencias, grupos de bienes y bienes individuales.</p>
        </div>
        <Badge variant="outline" className="text-xs">{bienes?.length || 0} bienes</Badge>
      </div>
      <DiagramWrapper
        initialNodes={layoutNodes} initialEdges={layoutEdges}
        isLoading={isLoading} bgClass="bg-gradient-to-br from-emerald-50/30 to-white dark:from-emerald-950/30 dark:to-gray-900"
        downloadLabel="diagrama-patrimonial" showLegend={showLegend}
        diagramKey={diagramKey} editMode={editMode} setEditMode={setEditMode}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   DIAGRAMA TECNICO
   ═══════════════════════════════════════════════════════════════════════════ */

function DiagramaTecnico({ showLegend, diagramKey, editMode, setEditMode }: {
  showLegend?: boolean; diagramKey: string; editMode: boolean; setEditMode: (v: boolean) => void;
}) {
  const { data: bienes } = useListBienes({});

  const { nodes: layoutNodes, edges: layoutEdges } = useMemo(() => {
    if (!bienes) return { nodes: [], edges: [] };
    const roots = bienes.filter((b: any) => !b.parentId);
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    let currentX = 40;

    for (const root of roots) {
      const comps = bienes.filter((c: any) => c.parentId === root.id);

      nodes.push({
        id: `bien-${root.id}`, type: 'dependencia',
        position: { x: currentX, y: 40 },
        data: {
          label: root.nombre,
          edificio: root.edificio || '-',
          piso: root.piso || '-',
          responsable: '-',
          bienesCount: comps.length,
          ubicacion: '',
          grupos: comps.map((c: any) => `${c.nombre} — ${c.marca || ''} ${c.modelo || ''}`.trim()),
        },
      });

      for (let i = 0; i < comps.length; i++) {
        const comp = comps[i];
        nodes.push({
          id: `comp-${comp.id}`, type: 'dependencia',
          position: { x: currentX + NODE_W + H_GAP, y: 40 + i * (NODE_H.dependencia + V_GAP) },
          data: {
            label: comp.nombre,
            edificio: comp.edificio || '-',
            piso: comp.piso || '-',
            responsable: '-',
            bienesCount: 1,
            ubicacion: '',
            grupos: [],
          },
        });
        edges.push({
          id: `e-${root.id}-${comp.id}`, source: `bien-${root.id}`, target: `comp-${comp.id}`,
          type: 'smoothstep', animated: true,
          style: { stroke: EDGE_COLORS['dependencia-grupo'], strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_COLORS['dependencia-grupo'], width: 12, height: 12 },
        });
      }

      currentX += NODE_W + H_GAP * 2;
    }

    return { nodes, edges };
  }, [bienes]);

  const isLoading = !bienes;

  return (
    <div className="flex flex-col">
      <div className="mb-2 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-lg font-bold">Relaciones Técnicas</h2>
          <p className="text-sm text-muted-foreground">Bienes principales y sus componentes.</p>
        </div>
        <Badge variant="outline" className="text-xs">{bienes?.filter((b: any) => !b.parentId).length || 0} equipos</Badge>
      </div>
      <DiagramWrapper
        initialNodes={layoutNodes} initialEdges={layoutEdges}
        isLoading={isLoading} bgClass="bg-gradient-to-br from-cyan-50/30 to-white dark:from-cyan-950/30 dark:to-gray-900"
        downloadLabel="diagrama-tecnico" showLegend={showLegend}
        diagramKey={diagramKey} editMode={editMode} setEditMode={setEditMode}
        />
    </div>
  );
}
