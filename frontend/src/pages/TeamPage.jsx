import { useEffect, useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import {
  Users, UserPlus, Mail, Send, CheckCircle, AlertCircle, Shield,
  User as UserIcon, Building2, X, Clock, RefreshCw, Ban, ChevronDown
} from 'lucide-react'
import api from '../services/api'
import { getErrorMessage } from '../utils/errorUtils'

const EXPIRY_OPTIONS = [
  { label: '24 hours', value: 24 },
  { label: '48 hours', value: 48 },
  { label: '3 days', value: 72 },
  { label: '7 days', value: 168 },
  { label: '14 days', value: 336 },
  { label: '30 days', value: 720 }
]

const STATUS_STYLES = {
  PENDING:  { bg: '#fef3c7', color: '#92400e', border: '#fde68a', label: 'Pending' },
  ACCEPTED: { bg: '#d1fae5', color: '#065f46', border: '#a7f3d0', label: 'Accepted' },
  EXPIRED:  { bg: '#fee2e2', color: '#991b1b', border: '#fecaca', label: 'Expired' },
  REVOKED:  { bg: '#f3f4f6', color: '#6b7280', border: '#e5e7eb', label: 'Revoked' }
}

export default function TeamPage() {
  const [users, setUsers] = useState([])
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('members') // 'members' | 'invitations'
  const { user: currentUser } = useSelector((state) => state.auth)

  // Invite modal
  const [showInvite, setShowInvite] = useState(false)
  const [emailInput, setEmailInput] = useState('')
  const [emailTags, setEmailTags] = useState([])
  const [expiryHours, setExpiryHours] = useState(48)
  const [inviteSending, setInviteSending] = useState(false)
  const [inviteResults, setInviteResults] = useState(null)
  const emailInputRef = useRef(null)

  useEffect(() => { fetchUsers(); fetchInvitations() }, [])

  const fetchUsers = () => {
    api.get('/api/users').then(res => {
      setUsers(res.data.data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  const fetchInvitations = () => {
    api.get('/api/invitations').then(res => {
      setInvitations(res.data.data || [])
    }).catch(() => {})
  }

  // ── Email Tag Logic ──
  const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

  const addEmail = (raw) => {
    const email = raw.trim().toLowerCase()
    if (!email || !isValidEmail(email) || emailTags.includes(email)) return
    setEmailTags(prev => [...prev, email])
    setEmailInput('')
  }

  const handleKeyDown = (e) => {
    if (['Enter', ',', 'Tab'].includes(e.key)) { e.preventDefault(); addEmail(emailInput) }
    if (e.key === 'Backspace' && !emailInput && emailTags.length > 0) setEmailTags(prev => prev.slice(0, -1))
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const valid = e.clipboardData.getData('text').split(/[,;\s\n]+/)
      .map(em => em.trim().toLowerCase()).filter(em => isValidEmail(em) && !emailTags.includes(em))
    setEmailTags(prev => [...prev, ...valid])
  }

  // ── Send Invites ──
  const handleInvite = async (e) => {
    e.preventDefault()
    if (emailInput.trim()) addEmail(emailInput)

    const allEmails = [...new Set([...emailTags, ...(emailInput.trim() && isValidEmail(emailInput.trim()) ? [emailInput.trim().toLowerCase()] : [])])]
    if (allEmails.length === 0) return

    setInviteSending(true)
    setInviteResults(null)

    try {
      const res = await api.post('/api/auth/invite', { emails: allEmails, expiryHours })
      setInviteResults(res.data.data || [])
      const sent = (res.data.data || []).filter(r => r.status === 'sent').map(r => r.email)
      setEmailTags(prev => prev.filter(e => !sent.includes(e)))
      setEmailInput('')
      fetchInvitations() // refresh list
    } catch (err) {
      setInviteResults([{ email: 'all', status: 'failed', reason: getErrorMessage(err, 'Failed to send invitations') }])
    } finally {
      setInviteSending(false)
    }
  }

  // ── Invite Actions ──
  const handleRevoke = async (id) => {
    try {
      await api.delete(`/api/invitations/${id}`)
      fetchInvitations()
    } catch (err) { alert(getErrorMessage(err, 'Failed to revoke invitation')) }
  }

  const handleResend = async (id) => {
    try {
      await api.post(`/api/invitations/${id}/resend`, { expiryHours: 48 })
      fetchInvitations()
    } catch (err) { alert(getErrorMessage(err, 'Failed to resend invitation')) }
  }

  const getInitials = (name) => name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?'
  const isAdmin = currentUser?.role === 'ADMIN'
  const orgName = currentUser?.organizationName || 'Your Organization'

  const pendingCount = invitations.filter(i => i.status === 'PENDING').length
  const acceptedCount = invitations.filter(i => i.status === 'ACCEPTED').length

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return ''
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  const formatExpiry = (dateStr) => {
    if (!dateStr) return ''
    const diff = new Date(dateStr).getTime() - Date.now()
    if (diff <= 0) return 'Expired'
    const hrs = Math.floor(diff / 3600000)
    if (hrs < 24) return `${hrs}h left`
    return `${Math.floor(hrs / 24)}d left`
  }

  if (loading) {
    return <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 rounded-lg" style={{ background: 'var(--border)' }} />
      {[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-xl" style={{ background: 'var(--border)' }} />)}
    </div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>Team</h1>
          <p className="text-sm mt-1 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
            <Building2 size={14} /> {orgName} • {users.length} member{users.length !== 1 ? 's' : ''}
            {pendingCount > 0 && <> • <span style={{ color: '#f59e0b' }}>{pendingCount} pending</span></>}
          </p>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={() => { setShowInvite(true); setInviteResults(null); setEmailTags([]); setEmailInput('') }}>
            <UserPlus size={18} /> Invite Members
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        {[
          { key: 'members', label: 'Members', count: users.length },
          { key: 'invitations', label: 'Invitations', count: invitations.length }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all"
            style={activeTab === tab.key
              ? { background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: '#fff' }
              : { color: 'var(--text-soft)' }
            }
          >
            {tab.label}
            <span className="ml-1.5 text-xs opacity-75">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* ─── Members Tab ─── */}
      {activeTab === 'members' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fadeIn">
          {users.map(u => (
            <div key={u.id} className="glass-card flex items-center gap-4 transition-all duration-200 hover:scale-[1.01]">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                style={{ background: u.role === 'ADMIN' ? 'linear-gradient(135deg, var(--primary), var(--accent))' : 'linear-gradient(135deg, #64748b, #94a3b8)' }}>
                {getInitials(u.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-semibold truncate" style={{ color: 'var(--text-main)' }}>{u.name}</p>
                  {u.id === currentUser?.userId && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary)' }}>You</span>
                  )}
                </div>
                <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{u.email}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {u.role === 'ADMIN' ? <Shield size={14} style={{ color: 'var(--primary)' }} /> : <UserIcon size={14} style={{ color: 'var(--text-muted)' }} />}
                <span className={`badge ${u.role === 'ADMIN' ? 'badge-urgent' : 'badge-in-progress'}`}>{u.role}</span>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <div className="col-span-full text-center py-16 glass-card">
              <Users size={48} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p className="font-semibold" style={{ color: 'var(--text-main)' }}>No team members yet</p>
            </div>
          )}
        </div>
      )}

      {/* ─── Invitations Tab ─── */}
      {activeTab === 'invitations' && (
        <div className="space-y-3 animate-fadeIn">
          {invitations.length === 0 ? (
            <div className="text-center py-16 glass-card">
              <Mail size={48} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p className="font-semibold" style={{ color: 'var(--text-main)' }}>No invitations yet</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                {isAdmin ? 'Click "Invite Members" to send your first invite.' : 'Ask your admin to invite team members.'}
              </p>
            </div>
          ) : (
            invitations.map(inv => {
              const style = STATUS_STYLES[inv.status] || STATUS_STYLES.PENDING
              return (
                <div key={inv.id} className="glass-card flex items-center gap-4 flex-wrap" >
                  {/* Avatar placeholder */}
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: `${style.bg}`, border: `1px solid ${style.border}` }}>
                    <Mail size={18} style={{ color: style.color }} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-main)' }}>{inv.email}</p>
                    <p className="text-xs flex items-center gap-2 flex-wrap" style={{ color: 'var(--text-muted)' }}>
                      <span>Invited by {inv.invitedByName}</span>
                      <span>•</span>
                      <span>{formatTimeAgo(inv.createdAt)}</span>
                      {inv.status === 'PENDING' && (
                        <><span>•</span>
                        <span className="flex items-center gap-0.5">
                          <Clock size={11} /> {formatExpiry(inv.expiresAt)}
                        </span></>
                      )}
                      {inv.status === 'ACCEPTED' && inv.acceptedAt && (
                        <><span>•</span><span>Accepted {formatTimeAgo(inv.acceptedAt)}</span></>
                      )}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                    style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}>
                    {style.label}
                  </span>

                  {/* Actions (admin only, pending/expired) */}
                  {isAdmin && (inv.status === 'PENDING' || inv.status === 'EXPIRED') && (
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleResend(inv.id)}
                        className="p-1.5 rounded-lg transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        title="Resend invite"
                      >
                        <RefreshCw size={15} style={{ color: '#3b82f6' }} />
                      </button>
                      {inv.status === 'PENDING' && (
                        <button
                          onClick={() => handleRevoke(inv.id)}
                          className="p-1.5 rounded-lg transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Revoke invite"
                        >
                          <Ban size={15} style={{ color: '#ef4444' }} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}

      {/* ─── Invite Modal ─── */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl p-6 shadow-2xl animate-fadeIn" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
                  <UserPlus size={20} color="white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>Invite Members</h2>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>to {orgName}</p>
                </div>
              </div>
              <button onClick={() => setShowInvite(false)} className="p-1.5 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700">
                <X size={18} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>

            {/* Results */}
            {inviteResults && (
              <div className="mb-4 space-y-1.5 max-h-32 overflow-y-auto animate-fadeIn">
                {inviteResults.filter(r => r.status === 'sent').length > 0 && (
                  <div className="flex items-center gap-2 rounded-lg p-2.5 text-sm font-medium" style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}>
                    <CheckCircle size={16} className="flex-shrink-0" />
                    {inviteResults.filter(r => r.status === 'sent').length} invitation(s) sent!
                  </div>
                )}
                {inviteResults.filter(r => r.status === 'failed').map((r, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg p-2.5 text-sm" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
                    <AlertCircle size={14} className="flex-shrink-0" />
                    <span className="font-medium">{r.email}</span>
                    <span className="text-xs opacity-75">— {r.reason}</span>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleInvite}>
              {/* Email Tags Input */}
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-soft)' }}>
                Email Addresses
                {emailTags.length > 0 && <span className="ml-2 text-xs font-normal" style={{ color: 'var(--text-muted)' }}>({emailTags.length} added)</span>}
              </label>
              <div
                className="rounded-xl p-2 flex flex-wrap gap-1.5 min-h-[52px] cursor-text transition-all"
                style={{ background: 'var(--bg-main)', border: '1px solid var(--border)' }}
                onClick={() => emailInputRef.current?.focus()}
              >
                {emailTags.map(email => (
                  <span key={email} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium animate-fadeIn"
                    style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))', color: '#6366f1', border: '1px solid rgba(99,102,241,0.2)' }}>
                    <Mail size={12} /> {email}
                    <button type="button" onClick={(ev) => { ev.stopPropagation(); setEmailTags(p => p.filter(t => t !== email)) }} className="ml-0.5 rounded-full p-0.5 hover:bg-red-100">
                      <X size={12} className="text-red-400" />
                    </button>
                  </span>
                ))}
                <input ref={emailInputRef} type="text"
                  className="flex-1 min-w-[180px] bg-transparent outline-none text-sm py-1 px-1"
                  style={{ color: 'var(--text-main)' }}
                  placeholder={emailTags.length === 0 ? 'name@company.com, team@company.com...' : 'Add more...'}
                  value={emailInput} onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={handleKeyDown} onPaste={handlePaste}
                  onBlur={() => { if (emailInput.trim()) addEmail(emailInput) }}
                />
              </div>
              <p className="text-[11px] mt-1 mb-4" style={{ color: 'var(--text-muted)' }}>
                Separate with Enter, comma, or paste a list
              </p>

              {/* Expiry Selector */}
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-soft)' }}>
                Invite Expiry
              </label>
              <div className="relative mb-5">
                <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <select
                  value={expiryHours}
                  onChange={(e) => setExpiryHours(Number(e.target.value))}
                  className="input-field pl-9 pr-8 appearance-none cursor-pointer"
                >
                  {EXPIRY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
              </div>

              <div className="flex gap-3">
                <button type="button" className="btn-secondary flex-1" onClick={() => setShowInvite(false)}>Cancel</button>
                <button type="submit" className="btn-primary flex-1" disabled={inviteSending || (emailTags.length === 0 && !emailInput.trim())}>
                  {inviteSending ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                  ) : (
                    <><Send size={16} /> Send {emailTags.length > 1 ? `${emailTags.length} Invites` : 'Invite'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
