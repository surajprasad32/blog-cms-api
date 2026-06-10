import { api } from './client'
import type { Comment } from '../types'

export async function listComments(postId: number): Promise<Comment[]> {
  const { data } = await api.get(`/posts/${postId}/comments`)
  return data
}

export async function createComment(postId: number, content: string, parentId?: number): Promise<Comment> {
  const { data } = await api.post(`/posts/${postId}/comments`, { content, parent_id: parentId })
  return data
}

export async function updateComment(commentId: number, content: string): Promise<Comment> {
  const { data } = await api.put(`/comments/${commentId}`, { content })
  return data
}

export async function deleteComment(commentId: number): Promise<void> {
  await api.delete(`/comments/${commentId}`)
}
