import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-full h-full bg-background p-4 text-center">
      <ShieldAlert className="w-20 h-20 text-muted-foreground/30 mb-6" />
      <h1 className="text-4xl font-bold tracking-tight mb-2">Página no encontrada</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        El recurso que intenta consultar no existe, fue movido o no tiene los permisos suficientes para acceder.
      </p>
      <Link href="/">
        <Button>Volver al Panel Principal</Button>
      </Link>
    </div>
  );
}
