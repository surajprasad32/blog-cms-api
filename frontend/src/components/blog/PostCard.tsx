import { Link } from 'react-router-dom'
import { Clock, User, Tag } from 'lucide-react'
import type { PostList } from '../../types'
import { formatDateShort, readingTime, tagColor, truncate } from '../../lib/utils'
import { cn } from '../../lib/utils'

interface PostCardProps {
  post: PostList
  featured?: boolean
}

export function PostCard({ post, featured = false }: PostCardProps) {
  const readTime = readingTime(post.excerpt || post.title)

  return (
    <Link to={`/blog/${post.slug}`} className={cn('block group', featured ? '' : '')}>
      <article
        className={cn(
          'card-hover h-full flex flex-col p-5 gap-4',
          featured && 'p-7'
        )}
      >
        {/* Category */}
        {post.category && (
          <span className="text-xs font-semibold tracking-widest uppercase text-accent">
            {post.category.name}
          </span>
        )}

        {/* Title */}
        <h2
          className={cn(
            'font-serif font-bold leading-tight text-zinc-100 group-hover:text-primary-light transition-colors',
            featured ? 'text-2xl' : 'text-lg'
          )}
        >
          {post.title}
        </h2>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-sm text-muted leading-relaxed flex-1">
            {truncate(post.excerpt, featured ? 200 : 120)}
          </p>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border bg-gradient-to-r',
                  tagColor(tag.name)
                )}
              >
                <Tag size={10} />
                {tag.name}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="text-xs text-muted">+{post.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-muted border-t border-border/50 pt-3 mt-auto">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary/50 to-accent/50 flex items-center justify-center text-white text-[10px] font-bold">
              {post.author.username[0].toUpperCase()}
            </div>
            <span>{post.author.username}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {readTime}m
            </span>
            <span>{formatDateShort(post.published_at || post.created_at)}</span>
          </div>
        </div>
      </article>
    </Link>
  )
}
