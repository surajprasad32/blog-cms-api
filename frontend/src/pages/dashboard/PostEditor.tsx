import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Save, Send, Eye, EyeOff, X, Plus, Tag, ChevronDown } from 'lucide-react'
import { createPost, updatePost, getPost, publishPost, unpublishPost } from '../../api/posts'
import { listCategories } from '../../api/categories'
import { listTags, createTag } from '../../api/tags'
import { useToast } from '../../components/ui/Toast'
import { Spinner } from '../../components/ui/Spinner'
import { readingTime, tagColor } from '../../lib/utils'
import { cn } from '../../lib/utils'

interface EditorProps {
  mode: 'create' | 'edit'
}

export function PostEditor({ mode }: EditorProps) {
  const { slug } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [postId, setPostId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [preview, setPreview] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [postStatus, setPostStatus] = useState<'draft' | 'published'>('draft')

  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: listCategories })
  const { data: tags = [] } = useQuery({ queryKey: ['tags'], queryFn: listTags })

  const { data: existingPost } = useQuery({
    queryKey: ['post-edit', slug],
    queryFn: () => getPost(slug!),
    enabled: mode === 'edit' && !!slug,
  })

  useEffect(() => {
    if (existingPost) {
      setPostId(existingPost.id)
      setTitle(existingPost.title)
      setContent(existingPost.content)
      setExcerpt(existingPost.excerpt || '')
      setCategoryId(existingPost.category?.id || null)
      setSelectedTagIds(existingPost.tags.map((t) => t.id))
      setPostStatus(existingPost.status as 'draft' | 'published')
    }
  }, [existingPost])

  const saveMut = useMutation({
    mutationFn: async () => {
      const body = { title, content, excerpt: excerpt || undefined, category_id: categoryId || undefined, tag_ids: selectedTagIds }
      if (mode === 'create') return createPost(body)
      return updatePost(postId!, body)
    },
    onSuccess: (post) => {
      queryClient.invalidateQueries({ queryKey: ['my-posts'] })
      toast('Post saved!')
      if (mode === 'create') navigate(`/dashboard/edit/${post.slug}`)
    },
    onError: () => toast('Failed to save', 'error'),
  })

  const publishMut = useMutation({
    mutationFn: async () => {
      const body = { title, content, excerpt: excerpt || undefined, category_id: categoryId || undefined, tag_ids: selectedTagIds }
      const saved = mode === 'create' ? await createPost(body) : await updatePost(postId!, body)
      if (postStatus !== 'published') return publishPost(saved.id)
      return unpublishPost(saved.id)
    },
    onSuccess: (post) => {
      queryClient.invalidateQueries({ queryKey: ['my-posts'] })
      const isNowPublished = post.status === 'published'
      toast(isNowPublished ? 'Post published! 🎉' : 'Post unpublished')
      setPostStatus(post.status as 'draft' | 'published')
      if (mode === 'create') navigate(`/dashboard/edit/${post.slug}`)
    },
    onError: () => toast('Failed to publish', 'error'),
  })

  const createTagMut = useMutation({
    mutationFn: () => createTag(newTag.trim()),
    onSuccess: (tag) => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      setSelectedTagIds((prev) => [...prev, tag.id])
      setNewTag('')
      toast(`Tag "${tag.name}" created`)
    },
    onError: () => toast('Failed to create tag', 'error'),
  })

  const toggleTag = (tagId: number) => {
    setSelectedTagIds((prev) => prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId])
  }

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length
  const readTime = readingTime(content)

  return (
    <div className="animate-fade-in">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-xs text-muted">
          <span>{wordCount} words</span>
          <span>·</span>
          <span>{readTime} min read</span>
          <span>·</span>
          <span className={cn(
            'font-medium',
            postStatus === 'published' ? 'text-emerald-400' : 'text-amber-400'
          )}>
            {postStatus}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPreview(!preview)} className="btn-ghost text-xs">
            {preview ? <EyeOff size={13} /> : <Eye size={13} />}
            {preview ? 'Edit' : 'Preview'}
          </button>
          <button onClick={() => saveMut.mutate()} disabled={!title || saveMut.isPending} className="btn-secondary text-xs">
            {saveMut.isPending ? <Spinner size="sm" /> : <Save size={13} />}
            Save draft
          </button>
          <button onClick={() => publishMut.mutate()} disabled={!title || publishMut.isPending} className="btn-primary text-xs">
            {publishMut.isPending ? <Spinner size="sm" /> : postStatus === 'published' ? <EyeOff size={13} /> : <Send size={13} />}
            {postStatus === 'published' ? 'Unpublish' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Main editor */}
        <div className="flex-1 min-w-0 space-y-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title…"
            className="w-full bg-transparent border-none outline-none font-serif text-3xl sm:text-4xl font-bold text-zinc-100 placeholder:text-zinc-700 resize-none"
          />

          <input
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Short excerpt or summary…"
            className="w-full bg-transparent border-none outline-none text-lg text-zinc-500 placeholder:text-zinc-800 font-serif italic"
          />

          <div className="h-px bg-border/60" />

          {preview ? (
            <div className="prose-dark min-h-[400px]">
              {content.split('\n').map((para, i) =>
                para.trim() ? <p key={i} className="mb-5 text-zinc-300 leading-[1.85]">{para}</p> : <br key={i} />
              )}
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your story here…&#10;&#10;Markdown-like formatting is preserved. Just write."
              className="w-full bg-transparent border-none outline-none text-zinc-300 text-base leading-[1.85] resize-none placeholder:text-zinc-800 min-h-[500px] font-sans"
              rows={25}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="xl:w-60 shrink-0 space-y-4">
          {/* Category */}
          <div className="card p-4">
            <h3 className="text-xs font-semibold tracking-widest uppercase text-muted mb-3">Category</h3>
            <div className="relative">
              <select
                value={categoryId || ''}
                onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
                className="input text-sm appearance-none pr-8"
              >
                <option value="">None</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            </div>
          </div>

          {/* Tags */}
          <div className="card p-4">
            <h3 className="text-xs font-semibold tracking-widest uppercase text-muted mb-3 flex items-center gap-1.5">
              <Tag size={11} /> Tags
            </h3>

            {/* Selected tags */}
            {selectedTagIds.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {tags.filter((t) => selectedTagIds.includes(t.id)).map((tag) => (
                  <span
                    key={tag.id}
                    className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border bg-gradient-to-r', tagColor(tag.name))}
                  >
                    {tag.name}
                    <button onClick={() => toggleTag(tag.id)} className="ml-0.5 hover:opacity-70">
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Available tags */}
            <div className="flex flex-wrap gap-1 mb-3">
              {tags.filter((t) => !selectedTagIds.includes(t.id)).map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className="text-xs px-2 py-0.5 rounded-full bg-surface border border-border text-muted hover:text-zinc-200 hover:border-primary/40 transition-all"
                >
                  + {tag.name}
                </button>
              ))}
            </div>

            {/* New tag */}
            <div className="flex gap-2">
              <input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && newTag.trim() && createTagMut.mutate()}
                placeholder="New tag…"
                className="input text-xs py-1.5 flex-1"
              />
              <button
                onClick={() => createTagMut.mutate()}
                disabled={!newTag.trim() || createTagMut.isPending}
                className="btn-primary text-xs px-2.5 py-1.5"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
