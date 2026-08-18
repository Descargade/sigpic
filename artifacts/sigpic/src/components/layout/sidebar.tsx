import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Server, 
  Building2, 
  Users2, 
  History, 
  FileBarChart, 
  FileText,
  Settings,
  Workflow,
  LogOut,
  ShieldAlert,
  Menu,
  X
} from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { useAuth } from '@/contexts/auth-context';

export function Sidebar() {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { name: 'Panel Principal', path: '/', icon: LayoutDashboard },
    { name: 'Bienes', path: '/bienes', icon: Server },
    { name: 'Dependencias', path: '/dependencias', icon: Building2 },
    { name: 'Responsables', path: '/responsables', icon: Users2 },
    { name: 'Movimientos', path: '/movimientos', icon: History },
    { name: 'Reportes', path: '/reportes', icon: FileBarChart },
    { name: 'Documentos', path: '/documentos', icon: FileText },
    { name: 'Diagramas', path: '/diagramas', icon: Workflow },
    { name: 'Configuración', path: '/configuracion', icon: Settings },
  ];

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-md bg-background border shadow-sm"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "flex flex-col w-64 h-screen border-r bg-card text-card-foreground fixed md:sticky top-0 z-40 transition-transform duration-200",
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
      <div className="flex items-center h-16 px-6 border-b">
        <ShieldAlert className="w-6 h-6 mr-3 text-primary" />
        <span className="font-bold text-lg tracking-tight">SIGPIC</span>
      </div>
      
      <div className="flex-1 py-4 overflow-y-auto">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = location === item.path || (item.path !== '/' && location.startsWith(item.path));
            return (
              <Link 
                key={item.path} 
                href={item.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5 mr-3", isActive ? "text-primary" : "text-muted-foreground")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex items-center mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
            {user?.nombre?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
          </div>
          <div className="ml-3 flex flex-col">
            <span className="text-sm font-medium leading-none">{user?.nombre || 'Usuario'}</span>
            <span className="text-xs text-muted-foreground mt-1">{user?.cargo || 'Sistemas'}</span>
          </div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors p-2"
          >
            {theme === "dark" ? "Modo Claro" : "Modo Oscuro"}
          </button>
          <button 
            onClick={logout}
            className="text-muted-foreground hover:text-destructive transition-colors p-2 rounded-md hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
      </div>
    </>
  );
}
