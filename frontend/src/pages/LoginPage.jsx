import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { login, clearError } from '../features/auth/authSlice'
import { Mail, Lock, Eye, EyeOff, FolderKanban } from 'lucide-react'

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth)

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard')
  }, [isAuthenticated, navigate])

  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(login(formData))
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-main)' }}>
      <div className="w-full max-w-md animate-fadeIn">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
          >
            <FolderKanban size={28} color="white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>Welcome back</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Sign in to your Task Manager account</p>
        </div>

        <div className="glass-card">
          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm font-medium" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-soft)' }}>Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  className="input-field pl-10"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-soft)' }}>Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff size={18} style={{ color: 'var(--text-muted)' }} /> : <Eye size={18} style={{ color: 'var(--text-muted)' }} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link to="/forgot-password" className="text-sm font-medium" style={{ color: 'var(--primary)' }}>
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm" style={{ color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold" style={{ color: 'var(--primary)' }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
