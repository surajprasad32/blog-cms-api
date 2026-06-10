import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, PenLine, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { register as apiRegister, getMe } from '../api/auth'
import { useAuthStore } from '../store/auth'
import { useToast } from '../components/ui/Toast'
import { Spinner } from '../components/ui/Spinner'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  username: z.string().min(3, 'At least 3 characters').max(50).regex(/^[a-zA-Z0-9_-]+$/, 'Letters, numbers, - and _ only'),
  password: z.string().min(8, 'At least 8 characters'),
})

type Form = z.infer<typeof schema>

export function Register() {
  const { setTokens, setUser } = useAuthStore()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [showPw, setShowPw] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: Form) => {
    try {
      const tokens = await apiRegister(data.email, data.username, data.password)
      setTokens(tokens.access_token, tokens.refresh_token)
      const me = await getMe()
      setUser(me)
      toast('Account created! Welcome to Inkwell 🎉')
      navigate('/dashboard')
    } catch (err: any) {
      toast(err?.response?.data?.detail || 'Registration failed', 'error')
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        <div className="card p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30 mb-4">
              <PenLine size={22} className="text-white" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-zinc-100">Create your account</h1>
            <p className="text-sm text-muted mt-1">Join Inkwell and start writing</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input {...register('email')} type="email" placeholder="you@example.com" className="input pl-9" autoComplete="email" />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Username</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input {...register('username')} placeholder="yourname" className="input pl-9" autoComplete="username" />
              </div>
              {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input {...register('password')} type={showPw ? 'text' : 'password'} placeholder="Min. 8 characters" className="input pl-9 pr-9" autoComplete="new-password" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-zinc-200">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-3">
              {isSubmitting ? <Spinner size="sm" /> : 'Create account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-light hover:underline font-medium">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
