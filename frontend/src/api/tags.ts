import { api } from './client'
import type { Tag } from '../types'

export async function listTags(): Promise<Tag[]> {
  const { data } = await api.get('/tags')
  return data
}

export async function createTag(name: string): Promise<Tag> {
  const { data } = await api.post('/tags', { name })
  return data
}

export async function deleteTag(id: number): Promise<void> {
  await api.delete(`/tags/${id}`)
}
