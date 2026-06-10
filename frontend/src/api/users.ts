import { api } from './client'
import type { User } from '../types'

export async function listUsers(): Promise<User[]> {
  const { data } = await api.get('/users')
  return data
}

export async function deleteUser(id: number): Promise<void> {
  await api.delete(`/users/${id}`)
}

export async function updateMe(body: { username?: string; email?: string; password?: string }): Promise<User> {
  const { data } = await api.put('/users/me', body)
  return data
}
