import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function EstadoFisicoBadge({ status, className }: StatusBadgeProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'excelente':
      case 'bueno':
        return 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20';
      case 'regular':
        return 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20';
      case 'malo':
      case 'irrecuperable':
        return 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20';
      default:
        return 'bg-slate-500/10 text-slate-500 hover:bg-slate-500/20 border-slate-500/20';
    }
  };

  return (
    <Badge variant="outline" className={cn("font-medium", getStatusColor(status), className)}>
      {status}
    </Badge>
  );
}

export function EstadoAdminBadge({ status, className }: StatusBadgeProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'en uso':
        return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20';
      case 'en depósito':
        return 'bg-slate-500/10 text-slate-500 hover:bg-slate-500/20 border-slate-500/20';
      case 'en reparación':
        return 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 border-purple-500/20';
      case 'prestado':
        return 'bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20 border-cyan-500/20';
      case 'extraviado':
        return 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-orange-500/20';
      case 'de baja':
        return 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20';
      default:
        return 'bg-slate-500/10 text-slate-500 hover:bg-slate-500/20 border-slate-500/20';
    }
  };

  return (
    <Badge variant="outline" className={cn("font-medium", getStatusColor(status), className)}>
      {status}
    </Badge>
  );
}
