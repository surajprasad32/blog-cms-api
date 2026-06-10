import { api } from './client'
import type { Post, PostList, PostCreate, PostUpdate, PaginatedResponse } from '../types'

export interface ListPostsParams {
  page?: number
  per_page?: number
  q?: string
  category?: string
  tag?: string
  status?: string
}

export async function listPosts(params: ListPostsParams = {}): Promise<PaginatedResponse<PostList>> {
  const { data } = await api.get('/posts', { params })
  return data
}

export async function getPost(slug: string): Promise<Post> {
  const { data } = await api.get(`/posts/${slug}`)
  return data
}

export async function createPost(body: PostCreate): Promise<Post> {
  const { data } = await api.post('/posts', body)
  return data
}

export async function updatePost(id: number, body: PostUpdate): Promise<Post> {
  const { data } = await api.put(`/posts/${id}`, body)
  return data
}

export async function deletePost(id: number): Promise<void> {
  await api.delete(`/posts/${id}`)
}

export async function publishPost(id: number): Promise<Post> {
  const { data } = await api.patch(`/posts/${id}/publish`)
  return data
}

export async function unpublishPost(id: number): Promise<Post> {
  const { data } = await api.patch(`/posts/${id}/unpublish`)
  return data
}
