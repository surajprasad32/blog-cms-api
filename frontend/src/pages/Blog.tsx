import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, Filter, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { listPosts } from '../api/posts'
import { listCategories } from '../api/categories'
import { listTags } from '../api/tags'
import { PostCard } from '../components/blog/PostCard'
import { PageSpinner } from '../components/ui/Spinner'
import { tagColor } from '../lib/utils'
import { cn } from '../lib/utils'

export function Blog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const page = Number(searchParams.get('page') || 1)
  const category = searchParams.get('category') || ''
  const tag = searchParams.get('tag') || ''

  const updateParam = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams)
    if (value) p.set(key, value)
    else p.delete(key)
    p.delete('page')
    setSearchParams(p)
  }

  const setPage = (n: number) => {
    const p = new URLSearchParams(searchParams)
    p.set('page', String(n))
    setSearchParams(p)
  }

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => updateParam('q', search), 400)
    return () => clearTimeout(t)
  }, [search])

  const { data, isLoading } = useQuery({
    queryKey: ['posts', { page, q: searchParams.get('q'), category, tag }],
    queryFn: () => listPosts({ page, per_page: 9, q: searchParams.get('q') || undefined, category: category || undefined, tag: tag || undefined }),
  })

  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: listCategories })
  const { data: tags = [] } = useQuery({ queryKey: ['tags'], queryFn: listTags })

  const posts = data?.data || []
  const totalPages = data?.pages || 1
  const hasFilters = !!(searchParams.get('q') || category || tag)

  const clearAll = () => setSearchParams({})

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 animate-fade-in">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-serif text-4xl font-bold text-zinc-100 mb-2">Blog</h1>
        <p className="text-muted">Explore articles, tutorials, and stories.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar filters */}
        <aside className="lg:w-60 shrink-0">
          <div className="sticky top-24 space-y-6">
            {/* Search */}
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search posts…"
                className="input pl-9 text-sm"
              />
              {search && (
                <button
                  onClick={() => { setSearch(''); updateParam('q', '') }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-zinc-200"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Categories */}
            {categories.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold tracking-widest uppercase text-muted mb-3 flex items-center gap-2">
                  <Filter size={12} /> Categories
                </h3>
                <div className="space-y-1">
                  <button
                    onClick={() => updateParam('category', '')}
                    className={cn('w-full text-left px-3 py-2 rounded-lg text-sm transition-all', !category ? 'bg-primary/10 text-primary-light' : 'text-muted hover:text-zinc-200 hover:bg-card')}
                  >
                    All
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => updateParam('category', cat.slug)}
                      className={cn('w-full text-left px-3 py-2 rounded-lg text-sm transition-all', category === cat.slug ? 'bg-primary/10 text-primary-light' : 'text-muted hover:text-zinc-200 hover:bg-card')}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold tracking-widest uppercase text-muted mb-3">Tags</h3>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => updateParam('tag', tag === t.slug ? '' : t.slug)}
                      className={cn(
                        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-gradient-to-r transition-all',
                        tagColor(t.name),
                        tag === t.slug ? 'ring-1 ring-primary/50' : 'opacity-70 hover:opacity-100'
                      )}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {hasFilters && (
              <button onClick={clearAll} className="w-full btn-ghost text-xs justify-center">
                <X size={12} /> Clear filters
              </button>
            )}
          </div>
        </aside>

        {/* Posts grid */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <PageSpinner />
          ) : posts.length === 0 ? (
            <div className="text-center py-20 text-muted">
              <Search size={36} className="mx-auto mb-3 opacity-30" />
              <p>No posts found{hasFilters ? ' for your filters' : ''}.</p>
              {hasFilters && <button onClick={clearAll} className="btn-ghost mt-4 text-sm">Clear filters</button>}
            </div>
          ) : (
            <>
              <p className="text-sm text-muted mb-5">{data?.total} article{data?.total !== 1 ? 's' : ''}</p>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="btn-secondary px-3 py-2 disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-sm text-muted px-4">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="btn-secondary px-3 py-2 disabled:opacity-40"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
