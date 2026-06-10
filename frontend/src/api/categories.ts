import { api } from './client'
import type { Category } from '../types'

export async function listCategories(): Promise<Category[]> {
  const { data } = await api.get('/categories')
  return data
}

export async function createCategory(name: string, description?: string): Promise<Category> {
  const { data } = await api.post('/categories', { name, description })
  return data
}

export async function updateCategory(id: number, name: string, description?: string): Promise<Category> {
  const { data } = await api.put(`/categories/${id}`, { name, description })
  return data
}

export async function deleteCategory(id: number): Promise<void> {
  await api.delete(`/categories/${id}`)
}
