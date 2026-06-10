import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Sparkles, TrendingUp, BookOpen } from 'lucide-react'
import { listPosts } from '../api/posts'
import { listCategories } from '../api/categories'
import { PostCard } from '../components/blog/PostCard'
import { PageSpinner } from '../components/ui/Spinner'

export function Home() {
  const { data: postsData, isLoading } = useQuery({
    queryKey: ['posts', { page: 1, per_page: 7 }],
    queryFn: () => listPosts({ page: 1, per_page: 7 }),
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: listCategories,
  })

  const posts = postsData?.data || []
  const featured = posts[0]
  const rest = posts.slice(1)

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5 pointer-events-none" />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, #7c3aed 0%, transparent 70%)' }}
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-20 text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-xs font-medium mb-6">
            <Sparkles size={12} />
            Modern publishing platform
          </div>

          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            Ideas worth
            <span className="block gradient-text">reading</span>
          </h1>

          <p className="text-lg text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            Discover thoughtful articles, tutorials, and stories from writers who care about their craft.
            A home for curious minds.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/blog" className="btn-primary px-7 py-3 text-base">
              <BookOpen size={18} />
              Start reading
            </Link>
            <Link to="/register" className="btn-secondary px-7 py-3 text-base">
              Start writing
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-16 text-sm text-muted">
            <div className="text-center">
              <div className="text-2xl font-bold text-zinc-100">{postsData?.total || 0}</div>
              <div>Articles</div>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <div className="text-2xl font-bold text-zinc-100">{categories.length}</div>
              <div>Topics</div>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <div className="text-2xl font-bold text-zinc-100">∞</div>
              <div>Ideas</div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">

        {/* Categories */}
        {categories.length > 0 && (
          <section className="mb-14">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-accent" />
              <h2 className="text-sm font-semibold tracking-widest uppercase text-muted">Browse Topics</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/blog?category=${cat.slug}`}
                  className="px-4 py-2 rounded-full bg-card border border-border text-sm text-zinc-300 hover:border-primary/40 hover:text-primary-light hover:bg-primary/5 transition-all"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {isLoading ? (
          <PageSpinner />
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-muted">
            <BookOpen size={40} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">No posts yet. Be the first to write!</p>
            <Link to="/register" className="btn-primary mt-4 inline-flex">Get started</Link>
          </div>
        ) : (
          <>
            {/* Featured post */}
            {featured && (
              <section className="mb-14">
                <div className="flex items-center gap-2 mb-5">
                  <Sparkles size={16} className="text-primary-light" />
                  <h2 className="text-sm font-semibold tracking-widest uppercase text-muted">Featured</h2>
                </div>
                <PostCard post={featured} featured />
              </section>
            )}

            {/* Rest of posts */}
            {rest.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-accent" />
                    <h2 className="text-sm font-semibold tracking-widest uppercase text-muted">Latest</h2>
                  </div>
                  <Link to="/blog" className="text-sm text-primary-light hover:underline flex items-center gap-1">
                    View all <ArrowRight size={14} />
                  </Link>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rest.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}
