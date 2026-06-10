import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { PenLine, BookOpen, LayoutDashboard, LogOut, Menu, X, User } from 'lucide-react'
import { useAuthStore } from '../../store/auth'
import { logout } from '../../api/auth'
import { useToast } from '../ui/Toast'

export function Navbar() {
  const { user, isAuthenticated, clear, refreshToken } = useAuthStore() as any
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      if (refreshToken) await logout(refreshToken)
    } catch {}
    clear()
    navigate('/')
    toast('Logged out successfully')
    setMenuOpen(false)
  }

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <header className="sticky top-0 z-40 glass border-b border-border/60">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-shadow">
            <PenLine size={16} className="text-white" />
          </div>
          <span className="font-serif text-xl font-bold text-zinc-100">Inkwell</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          <Link
            to="/blog"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive('/blog') ? 'text-primary-light bg-primary/10' : 'text-muted hover:text-zinc-200 hover:bg-card'
            }`}
          >
            <BookOpen size={15} />
            Blog
          </Link>
          {isAuthenticated && (
            <Link
              to="/dashboard"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/dashboard') ? 'text-primary-light bg-primary/10' : 'text-muted hover:text-zinc-200 hover:bg-card'
              }`}
            >
              <LayoutDashboard size={15} />
              Dashboard
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard/new" className="btn-primary text-xs">
                <PenLine size={14} />
                Write
              </Link>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/60 to-accent/60 flex items-center justify-center text-xs font-semibold text-white">
                  {user?.username?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm text-zinc-300">{user?.username}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  user?.role === 'admin' ? 'bg-amber-500/15 text-amber-400' :
                  user?.role === 'editor' ? 'bg-primary/15 text-primary-light' :
                  'bg-zinc-700/50 text-zinc-400'
                }`}>
                  {user?.role}
                </span>
              </div>
              <button onClick={handleLogout} className="btn-ghost text-xs px-3">
                <LogOut size={14} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">Sign in</Link>
              <Link to="/register" className="btn-primary">Get started</Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 rounded-lg text-muted hover:text-zinc-200 hover:bg-card"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border/60 bg-surface/95 px-4 py-4 flex flex-col gap-2 animate-fade-in">
          <Link to="/blog" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:bg-card">
            <BookOpen size={15} /> Blog
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:bg-card">
                <LayoutDashboard size={15} /> Dashboard
              </Link>
              <Link to="/dashboard/new" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:bg-card">
                <PenLine size={15} /> Write Post
              </Link>
              <div className="border-t border-border pt-2 mt-1">
                <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted">
                  <User size={14} /> {user?.username}
                </div>
                <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-card">
                  <LogOut size={15} /> Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2 border-t border-border">
              <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-secondary w-full justify-center">Sign in</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary w-full justify-center">Get started</Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
