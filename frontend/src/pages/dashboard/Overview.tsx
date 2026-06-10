import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { FileText, Send, PenLine, ArrowRight, Clock } from 'lucide-react'
import { listPosts } from '../../api/posts'
import { useAuthStore } from '../../store/auth'
import { PageSpinner } from '../../components/ui/Spinner'
import { formatDateShort, readingTime, truncate } from '../../lib/utils'

export function Overview() {
  const { user } = useAuthStore() as any

  const { data: draftData, isLoading: draftLoading } = useQuery({
    queryKey: ['my-drafts'],
    queryFn: () => listPosts({ status: 'draft', per_page: 3 }),
  })

  const { data: pubData, isLoading: pubLoading } = useQuery({
    queryKey: ['my-published'],
    queryFn: () => listPosts({ status: 'published', per_page: 3 }),
  })

  const drafts = draftData?.data || []
  const published = pubData?.data || []

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Published', value: pubData?.total ?? '…', icon: Send, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Drafts', value: draftData?.total ?? '…', icon: FileText, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Role', value: user?.role, icon: PenLine, color: 'text-primary-light', bg: 'bg-primary/10' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-5 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
              <Icon size={18} className={color} />
            </div>
            <div>
              <div className="text-xl font-bold text-zinc-100 capitalize">{value}</div>
              <div className="text-xs text-muted">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="card p-5">
        <h2 className="font-semibold text-zinc-200 mb-4">Quick actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/dashboard/new" className="btn-primary">
            <PenLine size={15} /> Write new post
          </Link>
          <Link to="/dashboard/posts" className="btn-secondary">
            <FileText size={15} /> Manage posts
          </Link>
        </div>
      </div>

      {/* Recent drafts */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-zinc-200 flex items-center gap-2">
            <FileText size={16} className="text-amber-400" /> Recent Drafts
          </h2>
          <Link to="/dashboard/posts" className="text-xs text-muted hover:text-primary-light flex items-center gap-1">
            All posts <ArrowRight size={12} />
          </Link>
        </div>
        {draftLoading ? <PageSpinner /> : drafts.length === 0 ? (
          <p className="text-sm text-muted text-center py-6">No drafts. <Link to="/dashboard/new" className="text-primary-light hover:underline">Write something!</Link></p>
        ) : (
          <div className="space-y-3">
            {drafts.map((post) => (
              <div key={post.id} className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-surface transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-200 truncate">{post.title}</p>
                  <p className="text-xs text-muted flex items-center gap-2 mt-0.5">
                    <Clock size={10} /> {readingTime(post.excerpt || post.title)}m read · {formatDateShort(post.created_at)}
                  </p>
                </div>
                <Link to={`/dashboard/edit/${post.slug}`} className="btn-ghost text-xs shrink-0 px-3">Edit</Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent published */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-zinc-200 flex items-center gap-2">
            <Send size={16} className="text-emerald-400" /> Published Posts
          </h2>
          <Link to="/blog" className="text-xs text-muted hover:text-primary-light flex items-center gap-1">
            View blog <ArrowRight size={12} />
          </Link>
        </div>
        {pubLoading ? <PageSpinner /> : published.length === 0 ? (
          <p className="text-sm text-muted text-center py-6">No published posts yet.</p>
        ) : (
          <div className="space-y-3">
            {published.map((post) => (
              <div key={post.id} className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-surface transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-200 truncate">{post.title}</p>
                  <p className="text-xs text-muted mt-0.5">{formatDateShort(post.published_at || post.created_at)}</p>
                </div>
                <Link to={`/blog/${post.slug}`} className="btn-ghost text-xs shrink-0 px-3">Read</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
