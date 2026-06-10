import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Edit2, Shield, Users, Tag, FolderOpen } from 'lucide-react'
import { listCategories, createCategory, deleteCategory } from '../../api/categories'
import { listTags, deleteTag } from '../../api/tags'
import { listUsers, deleteUser } from '../../api/users'
import { Modal } from '../../components/ui/Modal'
import { Spinner, PageSpinner } from '../../components/ui/Spinner'
import { useToast } from '../../components/ui/Toast'
import { useAuthStore } from '../../store/auth'
import { Navigate } from 'react-router-dom'
import { formatDateShort, tagColor } from '../../lib/utils'
import { cn } from '../../lib/utils'

export function Admin() {
  const { user } = useAuthStore() as any
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-2">
        <Shield size={18} className="text-amber-400" />
        <h2 className="font-serif text-xl font-bold text-zinc-100">Admin Panel</h2>
      </div>
      <UsersSection />
      <CategoriesSection />
      <TagsSection />
    </div>
  )
}

function UsersSection() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { user: me } = useAuthStore() as any

  const { data: users = [], isLoading } = useQuery({ queryKey: ['users'], queryFn: listUsers })

  const deleteMut = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); toast('User deleted') },
    onError: () => toast('Failed to delete user', 'error'),
  })

  const roleColor: Record<string, string> = {
    admin: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    editor: 'bg-primary/15 text-primary-light border-primary/20',
    reader: 'bg-zinc-700/50 text-zinc-400 border-zinc-600/20',
  }

  return (
    <div className="card p-5">
      <h3 className="font-semibold text-zinc-200 flex items-center gap-2 mb-5">
        <Users size={16} className="text-accent" /> Users ({users.length})
      </h3>
      {isLoading ? <PageSpinner /> : (
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-surface transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {u.username[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-200 truncate">{u.username}</p>
                  <p className="text-xs text-muted truncate">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={cn('text-xs px-2 py-0.5 rounded-full border', roleColor[u.role] || roleColor.reader)}>
                  {u.role}
                </span>
                {u.id !== me?.id && (
                  <button
                    onClick={() => { if (confirm(`Delete user ${u.username}?`)) deleteMut.mutate(u.id) }}
                    disabled={deleteMut.isPending}
                    className="btn-ghost px-2 py-1.5 hover:text-red-400"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CategoriesSection() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')

  const { data: categories = [], isLoading } = useQuery({ queryKey: ['categories'], queryFn: listCategories })

  const createMut = useMutation({
    mutationFn: () => createCategory(name, desc || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast('Category created')
      setModalOpen(false)
      setName('')
      setDesc('')
    },
    onError: () => toast('Failed to create category', 'error'),
  })

  const deleteMut = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories'] }); toast('Category deleted') },
    onError: () => toast('Failed to delete', 'error'),
  })

  return (
    <>
      <div className="card p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-zinc-200 flex items-center gap-2">
            <FolderOpen size={16} className="text-primary-light" /> Categories ({categories.length})
          </h3>
          <button onClick={() => setModalOpen(true)} className="btn-primary text-xs">
            <Plus size={13} /> Add
          </button>
        </div>
        {isLoading ? <PageSpinner /> : categories.length === 0 ? (
          <p className="text-sm text-muted text-center py-4">No categories yet.</p>
        ) : (
          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-surface transition-colors">
                <div>
                  <p className="text-sm font-medium text-zinc-200">{cat.name}</p>
                  {cat.description && <p className="text-xs text-muted">{cat.description}</p>}
                </div>
                <button
                  onClick={() => { if (confirm(`Delete "${cat.name}"?`)) deleteMut.mutate(cat.id) }}
                  className="btn-ghost px-2 py-1.5 hover:text-red-400"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Category">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-300 block mb-1.5">Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Category name" />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-300 block mb-1.5">Description</label>
            <input value={desc} onChange={(e) => setDesc(e.target.value)} className="input" placeholder="Optional description" />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={() => createMut.mutate()} disabled={!name.trim() || createMut.isPending} className="btn-primary">
              {createMut.isPending ? <Spinner size="sm" /> : 'Create'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}

function TagsSection() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [name, setName] = useState('')

  const { data: tags = [], isLoading } = useQuery({ queryKey: ['tags'], queryFn: listTags })

  const deleteMut = useMutation({
    mutationFn: deleteTag,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tags'] }); toast('Tag deleted') },
    onError: () => toast('Failed to delete', 'error'),
  })

  return (
    <div className="card p-5">
      <h3 className="font-semibold text-zinc-200 flex items-center gap-2 mb-5">
        <Tag size={16} className="text-accent" /> Tags ({tags.length})
      </h3>
      {isLoading ? <PageSpinner /> : (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-gradient-to-r', tagColor(tag.name))}
            >
              {tag.name}
              <button
                onClick={() => { if (confirm(`Delete tag "${tag.name}"?`)) deleteMut.mutate(tag.id) }}
                className="hover:opacity-60 transition-opacity"
              >
                <Trash2 size={10} />
              </button>
            </div>
          ))}
          {tags.length === 0 && <p className="text-sm text-muted">No tags yet.</p>}
        </div>
      )}
    </div>
  )
}
