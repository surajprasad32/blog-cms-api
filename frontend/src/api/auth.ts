import axios from 'axios'
import { api } from './client'
import type { Token, User } from '../types'

export async function login(email: string, password: string): Promise<Token> {
  const form = new URLSearchParams()
  form.append('username', email)
  form.append('password', password)
  const { data } = await axios.post('/api/v1/auth/login', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  return data
}

export async function register(email: string, username: string, password: string): Promise<Token> {
  const { data } = await api.post('/auth/register', { email, username, password })
  return data
}

export async function logout(refreshToken: string): Promise<void> {
  await api.post('/auth/logout', { refresh_token: refreshToken })
}

export async function getMe(): Promise<User> {
  const { data } = await api.get('/users/me')
  return data
}
