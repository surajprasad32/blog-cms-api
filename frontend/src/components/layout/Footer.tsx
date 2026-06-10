import { Link } from 'react-router-dom'
import { PenLine, Github, Twitter } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-surface/40 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <PenLine size={14} className="text-white" />
            </div>
            <span className="font-serif text-lg font-bold text-zinc-300">Inkwell</span>
          </Link>

          <div className="flex items-center gap-6 text-sm text-muted">
            <Link to="/blog" className="hover:text-zinc-300 transition-colors">Blog</Link>
            <Link to="/login" className="hover:text-zinc-300 transition-colors">Sign in</Link>
            <Link to="/register" className="hover:text-zinc-300 transition-colors">Register</Link>
          </div>

          <div className="flex items-center gap-1">
            <a href="#" className="p-2 rounded-lg text-muted hover:text-zinc-300 hover:bg-card transition-all">
              <Github size={16} />
            </a>
            <a href="#" className="p-2 rounded-lg text-muted hover:text-zinc-300 hover:bg-card transition-all">
              <Twitter size={16} />
            </a>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-border/40 text-center text-xs text-muted">
          © {new Date().getFullYear()} Inkwell. Built with FastAPI & React.
        </div>
      </div>
    </footer>
  )
}
