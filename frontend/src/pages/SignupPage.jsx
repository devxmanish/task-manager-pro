import { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { initiateSignup, verifyOtp, clearError } from '../features/auth/authSlice'
import { Mail, Lock, User, Eye, EyeOff, FolderKanban, ArrowLeft, ShieldCheck, RefreshCw, Building2 } from 'lucide-react'

export default function SignupPage() {
  const [searchParams] = useSearchParams()
  const inviteToken = searchParams.get('invite') || ''

  const [step, setStep] = useState('register') // 'register' | 'otp'
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    organizationName: ''
  })
  const [otp, setOtp] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, verificationToken, isAuthenticated } = useSelector((state) => state.auth)

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard')
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (verificationToken) {
      setStep('otp')
      setResendCooldown(30)
    }
  }, [verificationToken])

  useEffect(() => { dispatch(clearError()) }, [dispatch])

  // countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  const handleSignup = (e) => {
    e.preventDefault()
    setLocalError('')

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match')
      return
    }
    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters')
      return
    }
    if (!inviteToken && !formData.organizationName.trim()) {
      setLocalError('Organization name is required')
      return
    }

    dispatch(initiateSignup({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      organizationName: formData.organizationName || undefined,
      inviteToken: inviteToken || undefined
    }))
  }

  const handleVerifyOtp = (e) => {
    e.preventDefault()
    setLocalError('')

    if (otp.length !== 6) {
      setLocalError('OTP must be 6 digits')
      return
    }
    dispatch(verifyOtp({
      verificationToken,
      otp,
      name: formData.name,
      password: formData.password,
      organizationName: formData.organizationName || undefined,
      inviteToken: inviteToken || undefined
    }))
  }

  const handleResendOtp = useCallback(() => {
    if (resendCooldown > 0 || loading) return
    setLocalError('')
    setOtp('')
    dispatch(clearError())
    dispatch(initiateSignup({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      organizationName: formData.organizationName || undefined,
      inviteToken: inviteToken || undefined
    }))
  }, [resendCooldown, loading, formData, inviteToken, dispatch])

  const displayError = localError || error

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-main)' }}>
      <div className="w-full max-w-md animate-fadeIn">
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
          >
            {step === 'register' ? <FolderKanban size={28} color="white" /> : <ShieldCheck size={28} color="white" />}
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>
            {step === 'register'
              ? (inviteToken ? 'Join Your Team' : 'Create Account')
              : 'Verify Email'}
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            {step === 'register'
              ? (inviteToken ? 'Accept your invitation and create your account' : 'Create your organization on TaskManager Pro')
              : `Enter the OTP sent to ${formData.email}`
            }
          </p>
        </div>

        <div className="glass-card">
          {displayError && (
            <div className="mb-4 p-3 rounded-xl text-sm font-medium" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
              {displayError}
            </div>
          )}

          {step === 'register' ? (
            <form onSubmit={handleSignup} className="space-y-4">
              {/* Organization Name — only shown when NOT using invite */}
              {!inviteToken && (
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-soft)' }}>Organization Name</label>
                  <div className="relative">
                    <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    <input type="text" className="input-field pl-10" placeholder="e.g. Acme Corp" value={formData.organizationName}
                      onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })} required />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-soft)' }}>Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input type="text" className="input-field pl-10" placeholder="John Doe" value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-soft)' }}>Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input type="email" className="input-field pl-10" placeholder="you@example.com" value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-soft)' }}>Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input type={showPassword ? 'text' : 'password'} className="input-field pl-10 pr-10" placeholder="Min 6 characters" value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                    {showPassword ? <EyeOff size={18} style={{ color: 'var(--text-muted)' }} /> : <Eye size={18} style={{ color: 'var(--text-muted)' }} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-soft)' }}>Confirm Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input type="password" className="input-field pl-10" placeholder="Re-enter password" value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} required />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? 'Sending OTP...' : (inviteToken ? 'Join Team' : 'Create Organization')}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-soft)' }}>Enter 6-digit OTP</label>
                <input
                  type="text"
                  className="input-field text-center text-2xl tracking-[0.5em] font-mono"
                  placeholder="000000"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  autoFocus
                />
                <p className="text-xs mt-2 text-center" style={{ color: 'var(--text-muted)' }}>
                  OTP expires in 5 minutes
                </p>
              </div>
              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Create Account'}
              </button>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setStep('register'); setOtp(''); dispatch(clearError()) }} className="btn-secondary flex-1">
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || loading}
                  className="btn-secondary flex-1 flex items-center justify-center gap-1.5"
                  style={{ opacity: resendCooldown > 0 ? 0.5 : 1 }}
                >
                  <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                  {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}

          <p className="text-center mt-6 text-sm" style={{ color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold" style={{ color: 'var(--primary)' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
