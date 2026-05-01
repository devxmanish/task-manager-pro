import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { forgotPassword, resetPassword, clearError, clearMessage } from '../features/auth/authSlice'
import { Mail, Lock, FolderKanban, CheckCircle } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const dispatch = useDispatch()
  const { loading, error, message } = useSelector((state) => state.auth)

  useEffect(() => { dispatch(clearError()); dispatch(clearMessage()) }, [dispatch])

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(forgotPassword({ email }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-main)' }}>
      <div className="w-full max-w-md animate-fadeIn">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
            <FolderKanban size={28} color="white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>Forgot Password</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>We'll send you a reset link</p>
        </div>

        <div className="glass-card">
          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
              {error}
            </div>
          )}
          {message && (
            <div className="mb-4 p-3 rounded-xl text-sm flex items-center gap-2" style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>
              <CheckCircle size={16} /> {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-soft)' }}>Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input type="email" className="input-field pl-10" placeholder="you@example.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
          <p className="text-center mt-6 text-sm" style={{ color: 'var(--text-muted)' }}>
            <Link to="/login" className="font-semibold" style={{ color: 'var(--primary)' }}>Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localError, setLocalError] = useState('')
  const dispatch = useDispatch()
  const { loading, error, message } = useSelector((state) => state.auth)

  useEffect(() => { dispatch(clearError()); dispatch(clearMessage()) }, [dispatch])

  const handleSubmit = (e) => {
    e.preventDefault()
    setLocalError('')
    if (newPassword.length < 6) { setLocalError('Min 6 characters'); return }
    if (newPassword !== confirmPassword) { setLocalError('Passwords do not match'); return }
    dispatch(resetPassword({ token, newPassword }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-main)' }}>
      <div className="w-full max-w-md animate-fadeIn">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
            <Lock size={28} color="white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>Reset Password</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Enter your new password</p>
        </div>

        <div className="glass-card">
          {(localError || error) && (
            <div className="mb-4 p-3 rounded-xl text-sm" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
              {localError || error}
            </div>
          )}
          {message && (
            <div className="mb-4 p-3 rounded-xl text-sm flex items-center gap-2" style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>
              <CheckCircle size={16} /> {message}
              <Link to="/login" className="ml-auto font-semibold underline" style={{ color: 'var(--primary)' }}>Login</Link>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-soft)' }}>New Password</label>
              <input type="password" className="input-field" placeholder="Min 6 characters" value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-soft)' }}>Confirm Password</label>
              <input type="password" className="input-field" placeholder="Re-enter password" value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
