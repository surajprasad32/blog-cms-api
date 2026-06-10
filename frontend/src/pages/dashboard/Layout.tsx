import { type ReactNode } from 'react'
import { NavLink, Navigate } from 'react-router-dom'
import { LayoutDashboard, PenLine, FileText, Shield, Settings } from 'lucide-react'
import { useAuthStore } from '../../store/auth'
import { cn } from '../../lib/utils'

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { to: '/dashboard/posts', label: 'My Posts', icon: FileText },
  { to: '/dashboard/new', label: 'Write', icon: PenLine },
]

const adminItems = [
  { to: '/dashboard/admin', label: 'Admin', icon: Shield },
]

function SideNav() {
  const { user } = useAuthStore() as any
  const isAdmin = user?.role === 'admin'
  const isEditor = user?.role === 'editor' || isAdmin

  const link = 'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all'
  const active = 'bg-primary/10 text-primary-light font-medium'
  const inactive = 'text-muted hover:text-zinc-200 hover:bg-card'

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map(({ to, label, icon: Icon, exact }) => (
        <NavLink
          key={to}
          to={to}
          end={exact}
          className={({ isActive }) => cn(link, isActive ? active : inactive)}
        >
          <Icon size={15} />
          {label}
        </NavLink>
      ))}
      {isAdmin && (
        <>
          <div className="h-px bg-border my-2" />
          {adminItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => cn(link, isActive ? active : inactive)}>
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </>
      )}
    </nav>
  )
}

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuthStore() as any

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-zinc-100">Dashboard</h1>
        <p className="text-sm text-muted mt-0.5">
          Signed in as <span className="text-zinc-300">{user?.username}</span> ·{' '}
          <span className={cn(
            'font-medium',
            user?.role === 'admin' ? 'text-amber-400' :
            user?.role === 'editor' ? 'text-primary-light' : 'text-muted'
          )}>{user?.role}</span>
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-52 shrink-0">
          <div className="card p-3 sticky top-24">
            <SideNav />
          </div>
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
