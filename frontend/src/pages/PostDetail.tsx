import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Clock, Calendar, User, Tag } from 'lucide-react'
import { getPost } from '../api/posts'
import { CommentSection } from '../components/blog/CommentSection'
import { ReadingProgress } from '../components/ReadingProgress'
import { PageSpinner } from '../components/ui/Spinner'
import { formatDate, readingTime, tagColor } from '../lib/utils'
import { cn } from '../lib/utils'

export function PostDetail() {
  const { slug } = useParams<{ slug: string }>()

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ['post', slug],
    queryFn: () => getPost(slug!),
    enabled: !!slug,
  })

  if (isLoading) return <PageSpinner />

  if (isError || !post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h1 className="font-serif text-3xl font-bold text-zinc-100 mb-4">Post not found</h1>
        <Link to="/blog" className="btn-primary">Back to Blog</Link>
      </div>
    )
  }

  const readTime = readingTime(post.content)

  return (
    <>
      <ReadingProgress />

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 animate-fade-in">
        {/* Back */}
        <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-zinc-200 transition-colors mb-10">
          <ArrowLeft size={15} /> Back to Blog
        </Link>

        {/* Category */}
        {post.category && (
          <Link
            to={`/blog?category=${post.category.slug}`}
            className="text-xs font-bold tracking-widest uppercase text-accent hover:text-accent/80 transition-colors"
          >
            {post.category.name}
          </Link>
        )}

        {/* Title */}
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-zinc-100 leading-tight mt-3 mb-6">
          {post.title}
        </h1>

        {/* Meta bar */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted mb-8 pb-8 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/60 to-accent/60 flex items-center justify-center text-white text-sm font-bold">
              {post.author.username[0].toUpperCase()}
            </div>
            <span className="text-zinc-300 font-medium">{post.author.username}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={13} />
            {formatDate(post.published_at || post.created_at)}
          </div>
          <div className="flex items-center gap-1">
            <Clock size={13} />
            {readTime} min read
          </div>
        </div>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-xl text-zinc-400 leading-relaxed font-serif mb-10 italic border-l-4 border-primary/40 pl-5">
            {post.excerpt}
          </p>
        )}

        {/* Content */}
        <div className="prose-dark text-base leading-relaxed">
          {post.content.split('\n').map((para, i) =>
            para.trim() ? <p key={i} className="mb-5 text-zinc-300 leading-[1.85]">{para}</p> : null
          )}
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-border/60">
            <span className="text-xs text-muted flex items-center gap-1 mr-2">
              <Tag size={12} /> Tags:
            </span>
            {post.tags.map((tag) => (
              <Link
                key={tag.id}
                to={`/blog?tag=${tag.slug}`}
                className={cn(
                  'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-gradient-to-r transition-all hover:scale-105',
                  tagColor(tag.name)
                )}
              >
                {tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Author card */}
        <div className="mt-12 p-6 card flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/60 to-accent/60 flex items-center justify-center text-white text-xl font-bold shrink-0">
            {post.author.username[0].toUpperCase()}
          </div>
          <div>
            <div className="text-xs text-muted mb-1 flex items-center gap-1"><User size={11} /> Written by</div>
            <div className="font-semibold text-zinc-100">{post.author.username}</div>
          </div>
        </div>

        {/* Comments */}
        <CommentSection postId={post.id} />
      </article>
    </>
  )
}
