import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MessageSquare, Reply, Trash2, Send } from 'lucide-react'
import { listComments, createComment, deleteComment } from '../../api/comments'
import { useAuthStore } from '../../store/auth'
import { useToast } from '../ui/Toast'
import { Spinner } from '../ui/Spinner'
import { timeAgo } from '../../lib/utils'
import type { Comment } from '../../types'

interface CommentItemProps {
  comment: Comment
  postId: number
  depth?: number
  currentUserId?: number
  currentUserRole?: string
}

function CommentItem({ comment, postId, depth = 0, currentUserId, currentUserRole }: CommentItemProps) {
  const [replying, setReplying] = useState(false)
  const [replyText, setReplyText] = useState('')
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const replyMutation = useMutation({
    mutationFn: () => createComment(postId, replyText, comment.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] })
      setReplyText('')
      setReplying(false)
      toast('Reply posted')
    },
    onError: () => toast('Failed to post reply', 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteComment(comment.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] })
      toast('Comment deleted')
    },
    onError: () => toast('Failed to delete comment', 'error'),
  })

  const canDelete = currentUserId === comment.author.id || currentUserRole === 'admin'

  return (
    <div className={depth > 0 ? 'border-l-2 border-border/60 pl-4 ml-3' : ''}>
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center text-white text-sm font-bold shrink-0">
          {comment.author.username[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm font-medium text-zinc-200">{comment.author.username}</span>
            <span className="text-xs text-muted">{timeAgo(comment.created_at)}</span>
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed">{comment.content}</p>
          <div className="flex items-center gap-3 mt-2">
            {currentUserId && depth < 2 && (
              <button
                onClick={() => setReplying(!replying)}
                className="flex items-center gap-1 text-xs text-muted hover:text-primary-light transition-colors"
              >
                <Reply size={12} /> Reply
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-1 text-xs text-muted hover:text-red-400 transition-colors"
              >
                <Trash2 size={12} /> Delete
              </button>
            )}
          </div>

          {replying && (
            <div className="mt-3 flex gap-2">
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${comment.author.username}…`}
                className="input text-xs py-2 flex-1"
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && replyText.trim() && replyMutation.mutate()}
              />
              <button
                onClick={() => replyMutation.mutate()}
                disabled={!replyText.trim() || replyMutation.isPending}
                className="btn-primary text-xs px-3 py-2"
              >
                {replyMutation.isPending ? <Spinner size="sm" /> : <Send size={12} />}
              </button>
            </div>
          )}
        </div>
      </div>

      {comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              depth={depth + 1}
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function CommentSection({ postId }: { postId: number }) {
  const [text, setText] = useState('')
  const { user, isAuthenticated } = useAuthStore() as any
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => listComments(postId),
  })

  const mutation = useMutation({
    mutationFn: () => createComment(postId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] })
      setText('')
      toast('Comment posted!')
    },
    onError: () => toast('Failed to post comment', 'error'),
  })

  return (
    <section className="mt-16">
      <h2 className="flex items-center gap-2 text-xl font-serif font-bold text-zinc-100 mb-8">
        <MessageSquare size={20} className="text-primary-light" />
        {comments.length} Comment{comments.length !== 1 ? 's' : ''}
      </h2>

      {/* New comment box */}
      {isAuthenticated ? (
        <div className="card p-5 mb-8">
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/60 to-accent/60 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Share your thoughts…"
                rows={3}
                className="input resize-none text-sm"
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => mutation.mutate()}
                  disabled={!text.trim() || mutation.isPending}
                  className="btn-primary text-xs"
                >
                  {mutation.isPending ? <Spinner size="sm" /> : <Send size={13} />}
                  Post comment
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card p-5 mb-8 text-center text-sm text-muted">
          <a href="/login" className="text-primary-light hover:underline">Sign in</a> to join the conversation.
        </div>
      )}

      {/* Comments list */}
      {isLoading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 text-muted">
          <MessageSquare size={32} className="mx-auto mb-3 opacity-30" />
          <p>No comments yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              currentUserId={user?.id}
              currentUserRole={user?.role}
            />
          ))}
        </div>
      )}
    </section>
  )
}
