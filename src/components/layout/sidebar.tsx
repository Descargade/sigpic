import { Link, useLocation } from 'wouter'
import {
  LayoutDashboard,
  Briefcase,
  User,
  FolderKanban,
  Settings,
  Database,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/oportunidades', label: 'Oportunidades', icon: Briefcase },
  { href: '/perfil', label: 'Perfil', icon: User },
  { href: '/portfolio', label: 'Portfolio', icon: FolderKanban },
  { href: '/configuracion', label: 'Configuración', icon: Settings },
]

export function Sidebar() {
  const [location] = useLocation()

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-sidebar">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
          2A
        </div>
        <span className="text-lg font-bold text-sidebar-foreground">2bleA</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = location === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <Link
          href="/configuracion#backup"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Database className="h-3 w-3" />
          Backup & Datos
        </Link>
      </div>
    </aside>
  )
}
