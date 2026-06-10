export interface User {
  id: number
  email: string
  username: string
  role: 'reader' | 'editor' | 'admin'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserPublic {
  id: number
  username: string
}

export interface Category {
  id: number
  name: string
  slug: string
  description?: string
}

export interface Tag {
  id: number
  name: string
  slug: string
}

export interface Post {
  id: number
  title: string
  slug: string
  content: string
  excerpt?: string
  status: 'draft' | 'published'
  published_at?: string
  author: UserPublic
  category?: Category
  tags: Tag[]
  created_at: string
  updated_at: string
}

export interface PostList {
  id: number
  title: string
  slug: string
  excerpt?: string
  status: 'draft' | 'published'
  published_at?: string
  author: UserPublic
  category?: Category
  tags: Tag[]
  created_at: string
}

export interface Comment {
  id: number
  content: string
  author: UserPublic
  post_id: number
  parent_id?: number
  replies: Comment[]
  created_at: string
  updated_at: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  pages: number
}

export interface Token {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface PostCreate {
  title: string
  content: string
  excerpt?: string
  category_id?: number
  tag_ids: number[]
}

export interface PostUpdate {
  title?: string
  content?: string
  excerpt?: string
  category_id?: number
  tag_ids?: number[]
}
