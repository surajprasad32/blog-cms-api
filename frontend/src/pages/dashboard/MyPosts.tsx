import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { PenLine, Trash2, Send, EyeOff, Eye, FileText } from 'lucide-react'
import { listPosts, deletePost, publishPost, unpublishPost } from '../../api/posts'
import { useToast } from '../../components/ui/Toast'
import { PageSpinner } from '../../components/ui/Spinner'
import { formatDateShort } from '../../lib/utils'
import { cn } from '../../lib/utils'
import type { PostList } from '../../types'

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
      status === 'published'
        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
        : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
    )}>
      {status === 'published' ? <Send size={10} /> : <FileText size={10} />}
      {status}
    </span>
  )
}

export function MyPosts() {
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data, isLoading } = useQuery({
    queryKey: ['my-posts', filter],
    queryFn: () => listPosts({ status: filter === 'all' ? undefined : filter, per_page: 50 }),
  })

  const deleteMut = useMutation({
    mutationFn: (id: number) => deletePost(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['my-posts'] }); toast('Post deleted') },
    onError: () => toast('Failed to delete', 'error'),
  })

  const publishMut = useMutation({
    mutationFn: ({ id, published }: { id: number; published: boolean }) =>
      published ? unpublishPost(id) : publishPost(id),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['my-posts'] })
      toast(vars.published ? 'Post unpublished' : 'Post published! 🎉')
    },
    onError: () => toast('Action failed', 'error'),
  })

  const posts = data?.data || []

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl font-bold text-zinc-100">My Posts</h2>
        <Link to="/dashboard/new" className="btn-primary text-xs">
          <PenLine size={13} /> New post
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 bg-surface rounded-xl w-fit border border-border">
        {(['all', 'published', 'draft'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all',
              filter === f ? 'bg-card text-zinc-100 shadow-sm' : 'text-muted hover:text-zinc-300'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading ? <PageSpinner /> : posts.length === 0 ? (
        <div className="text-center py-16 text-muted">
          <FileText size={36} className="mx-auto mb-3 opacity-30" />
          <p>No {filter === 'all' ? '' : filter} posts yet.</p>
          <Link to="/dashboard/new" className="btn-primary mt-4 inline-flex text-sm">Write your first post</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <PostRow
              key={post.id}
              post={post}
              onDelete={() => {
                if (confirm('Delete this post?')) deleteMut.mutate(post.id)
              }}
              onTogglePublish={() => publishMut.mutate({ id: post.id, published: post.status === 'published' })}
              isLoading={deleteMut.isPending || publishMut.isPending}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function PostRow({
  post,
  onDelete,
  onTogglePublish,
  isLoading,
}: {
  post: PostList
  onDelete: () => void
  onTogglePublish: () => void
  isLoading: boolean
}) {
  return (
    <div className="card-hover p-4 flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <StatusBadge status={post.status} />
          {post.category && (
            <span className="text-xs text-accent">{post.category.name}</span>
          )}
        </div>
        <p className="text-sm font-medium text-zinc-100 truncate">{post.title}</p>
        <p className="text-xs text-muted mt-0.5">{formatDateShort(post.created_at)}</p>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Link to={`/dashboard/edit/${post.slug}`} className="btn-ghost text-xs px-2.5 py-2">
          <PenLine size={13} />
        </Link>
        {post.status === 'published' && (
          <Link to={`/blog/${post.slug}`} target="_blank" className="btn-ghost text-xs px-2.5 py-2">
            <Eye size={13} />
          </Link>
        )}
        <button
          onClick={onTogglePublish}
          disabled={isLoading}
          title={post.status === 'published' ? 'Unpublish' : 'Publish'}
          className={cn('btn-ghost text-xs px-2.5 py-2', post.status === 'published' ? 'hover:text-amber-400' : 'hover:text-emerald-400')}
        >
          {post.status === 'published' ? <EyeOff size={13} /> : <Send size={13} />}
        </button>
        <button
          onClick={onDelete}
          disabled={isLoading}
          className="btn-ghost text-xs px-2.5 py-2 hover:text-red-400"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}
