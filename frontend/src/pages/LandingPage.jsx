import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  FolderKanban, Zap, Shield, Bell, Users, ArrowRight,
  CheckCircle, BarChart3, Clock, Sparkles, Globe,
  Building2, Mail, Lock, Layers, UserPlus
} from 'lucide-react'

const features = [
  { icon: Building2, title: 'Multi-Tenant SaaS', desc: 'Each company gets its own isolated workspace. Manage your organization, invite team members, and scale independently.', color: '#6366f1' },
  { icon: FolderKanban, title: 'Kanban Boards', desc: 'Drag tasks through columns — To Do, In Progress, In Review, Done. Full visual project clarity for your team.', color: '#a855f7' },
  { icon: Bell, title: 'Real-Time Updates', desc: 'WebSocket-powered live sync. See task changes, comments, and status updates instantly across all team members.', color: '#f59e0b' },
  { icon: Users, title: 'Team Management', desc: 'Invite members via email, assign roles, manage project access — all within your organization\'s workspace.', color: '#22c55e' },
  { icon: Shield, title: 'Enterprise Security', desc: 'HMAC-signed tokens, JWT auth, role-based access control, and org-level data isolation built in.', color: '#ef4444' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Task breakdowns, overdue alerts, progress tracking, and team activity — all scoped to your organization.', color: '#3b82f6' }
]

const stats = [
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '<50ms', label: 'API Response' },
  { value: '100%', label: 'Data Isolation' },
  { value: '∞', label: 'Organizations' }
]

const pricingPlans = [
  { name: 'Starter', price: 'Free', period: 'forever', desc: 'Perfect for small teams getting started', features: ['Up to 5 members', '3 projects', 'Kanban boards', 'Email notifications', 'Basic analytics'], cta: 'Get Started Free', primary: false },
  { name: 'Pro', price: '$12', period: '/user/month', desc: 'For growing teams that need more power', features: ['Unlimited members', 'Unlimited projects', 'Real-time WebSocket sync', 'Priority email support', 'Advanced analytics', 'Custom roles'], cta: 'Start Pro Trial', primary: true },
  { name: 'Enterprise', price: 'Custom', period: '', desc: 'For large organizations with custom needs', features: ['Everything in Pro', 'SSO & SAML', 'Dedicated support', 'SLA guarantees', 'Custom integrations', 'On-premise option'], cta: 'Contact Sales', primary: false }
]

export default function LandingPage() {
  const { isAuthenticated } = useSelector((state) => state.auth)

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-main)' }}>

      {/* ─── Navbar ─── */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg" style={{ background: 'rgba(255,255,255,0.85)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
              <FolderKanban size={20} color="white" />
            </div>
            <span className="font-extrabold text-lg tracking-tight" style={{ color: 'var(--text-main)' }}>
              TaskManager <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))', color: '#6366f1' }}>Pro</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium" style={{ color: 'var(--text-soft)' }}>
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#pricing">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary">Dashboard <ArrowRight size={16} /></Link>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-semibold rounded-xl transition-colors" style={{ color: 'var(--text-soft)' }}>Sign In</Link>
                <Link to="/signup" className="btn-primary">Start Free <ArrowRight size={16} /></Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-15 blur-3xl animate-pulse-glow" style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-10 blur-3xl animate-pulse-glow" style={{ background: 'radial-gradient(circle, #a855f7, transparent)', animationDelay: '1s' }} />
        </div>
        <div className="max-w-7xl mx-auto px-6 py-24 lg:py-36 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8 animate-fadeIn" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))', color: '#6366f1', border: '1px solid rgba(99,102,241,0.2)' }}>
            <Sparkles size={14} /> SaaS Platform for Modern Teams
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 animate-fadeIn" style={{ color: 'var(--text-main)' }}>
            Your Team's
            <br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)' }}>
              Command Center.
            </span>
          </h1>
          <p className="text-lg lg:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-fadeIn" style={{ color: 'var(--text-muted)', animationDelay: '0.1s' }}>
            The multi-tenant project management platform with real-time collaboration, instant notifications, and enterprise-grade security. Create your organization and start shipping faster.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <Link to="/signup" className="btn-primary text-base !px-8 !py-3.5 !rounded-2xl shadow-lg" style={{ boxShadow: '0 8px 32px rgba(99,102,241,0.3)' }}>
              Create Your Organization <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-secondary text-base !px-8 !py-3.5 !rounded-2xl">Sign In</Link>
          </div>

          {/* Hero Kanban preview */}
          <div className="mt-16 lg:mt-24 max-w-5xl mx-auto animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            <div className="rounded-2xl p-1" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(168,85,247,0.3), rgba(236,72,153,0.2))', boxShadow: '0 24px 80px rgba(99,102,241,0.15)' }}>
              <div className="rounded-xl p-6 lg:p-8" style={{ background: 'var(--bg-card)' }}>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="ml-3 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Acme Corp — Sprint 4</span>
                  <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>Live Sync ●</span>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { title: 'To Do', color: '#94a3b8', tasks: ['Design login screen', 'Setup CI/CD'] },
                    { title: 'In Progress', color: '#3b82f6', tasks: ['Build REST API', 'User auth flow'] },
                    { title: 'In Review', color: '#f59e0b', tasks: ['Dashboard UI'] },
                    { title: 'Done', color: '#22c55e', tasks: ['Project setup', 'Database schema', 'JWT tokens'] }
                  ].map((col) => (
                    <div key={col.title} className="rounded-lg p-3" style={{ background: 'var(--bg-main)', border: '1px solid var(--border)' }}>
                      <div className="flex items-center gap-2 mb-2.5">
                        <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                        <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>{col.title}</span>
                        <span className="text-[10px] ml-auto px-1.5 py-0.5 rounded" style={{ background: 'var(--border)', color: 'var(--text-muted)' }}>{col.tasks.length}</span>
                      </div>
                      {col.tasks.map((t, i) => (
                        <div key={i} className="mb-1.5 p-2 rounded-md text-xs" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-soft)' }}>{t}</div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats bar ─── */}
      <section className="border-y" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <div key={s.label} className="text-center py-8 px-4" style={{ borderRight: i < stats.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <p className="text-3xl lg:text-4xl font-extrabold bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>{s.value}</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>PLATFORM FEATURES</span>
          <h2 className="text-3xl lg:text-4xl font-extrabold" style={{ color: 'var(--text-main)' }}>Built for teams of every size</h2>
          <p className="mt-3 text-lg max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>From startups to enterprises — every organization gets a fully isolated, feature-rich workspace.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={f.title} className="glass-card group hover:scale-[1.02] transition-all duration-300 cursor-default" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 group-hover:rotate-3" style={{ background: `${f.color}15`, color: f.color }}>
                <f.icon size={24} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-main)' }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section id="how-it-works" style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>HOW IT WORKS</span>
            <h2 className="text-3xl lg:text-4xl font-extrabold" style={{ color: 'var(--text-main)' }}>Get started in minutes</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Create Your Org', desc: 'Sign up, name your organization, and become the admin automatically.', icon: Building2 },
              { step: '02', title: 'Invite Your Team', desc: 'Send email invites — team members join your org with one click.', icon: UserPlus },
              { step: '03', title: 'Create Projects', desc: 'Set up projects, assign tasks, set priorities and deadlines.', icon: FolderKanban },
              { step: '04', title: 'Ship & Collaborate', desc: 'Real-time sync keeps everyone aligned. Ship faster together.', icon: Zap }
            ].map((item) => (
              <div key={item.step} className="text-center group">
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto transition-transform group-hover:scale-110 group-hover:-rotate-6" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))', border: '2px solid rgba(99,102,241,0.15)' }}>
                    <item.icon size={32} style={{ color: '#6366f1' }} />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>{item.step}</span>
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-main)' }}>{item.title}</h3>
                <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4" style={{ background: 'rgba(168,85,247,0.1)', color: '#a855f7' }}>PRICING</span>
          <h2 className="text-3xl lg:text-4xl font-extrabold" style={{ color: 'var(--text-main)' }}>Simple, transparent pricing</h2>
          <p className="mt-3 text-lg max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>Start free. Upgrade when you need more.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className="rounded-2xl p-6 lg:p-8 relative transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: plan.primary ? 'linear-gradient(135deg, #6366f1, #7c3aed)' : 'var(--bg-card)',
                border: plan.primary ? 'none' : '1px solid var(--border)',
                boxShadow: plan.primary ? '0 20px 60px rgba(99,102,241,0.3)' : 'none'
              }}
            >
              {plan.primary && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-bold text-white" style={{ background: 'linear-gradient(135deg, #ec4899, #f59e0b)' }}>MOST POPULAR</div>}
              <h3 className="text-lg font-bold" style={{ color: plan.primary ? '#fff' : 'var(--text-main)' }}>{plan.name}</h3>
              <div className="flex items-baseline gap-1 mt-2 mb-1">
                <span className="text-4xl font-extrabold" style={{ color: plan.primary ? '#fff' : 'var(--text-main)' }}>{plan.price}</span>
                {plan.period && <span className="text-sm" style={{ color: plan.primary ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)' }}>{plan.period}</span>}
              </div>
              <p className="text-sm mb-6" style={{ color: plan.primary ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)' }}>{plan.desc}</p>
              <ul className="space-y-2.5 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm" style={{ color: plan.primary ? 'rgba(255,255,255,0.9)' : 'var(--text-soft)' }}>
                    <CheckCircle size={16} style={{ color: plan.primary ? '#86efac' : '#22c55e' }} className="flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/signup"
                className="block text-center py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105"
                style={plan.primary
                  ? { background: '#fff', color: '#6366f1' }
                  : { background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: '#fff' }
                }
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="rounded-3xl p-12 lg:p-16 text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed, #a855f7)' }}>
          <div className="absolute top-0 left-0 w-40 h-40 rounded-full opacity-20 blur-3xl" style={{ background: '#fff' }} />
          <div className="absolute bottom-0 right-0 w-60 h-60 rounded-full opacity-10 blur-3xl" style={{ background: '#fff' }} />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
              <Globe size={14} /> Trusted by teams worldwide
            </div>
            <h2 className="text-3xl lg:text-5xl font-extrabold text-white mb-4">Ready to transform your workflow?</h2>
            <p className="text-lg text-white/70 max-w-xl mx-auto mb-8">Create your organization in 30 seconds. Free to start, powerful enough to scale.</p>
            <Link to="/signup" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-base font-bold transition-transform hover:scale-105" style={{ background: '#fff', color: '#6366f1', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
              Get Started Free <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
              <FolderKanban size={14} color="white" />
            </div>
            <span className="font-bold text-sm" style={{ color: 'var(--text-main)' }}>TaskManager Pro</span>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>© {new Date().getFullYear()} TaskManager Pro. SaaS Platform for Teams.</p>
          <div className="flex items-center gap-4">
            <a href="#features" className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Features</a>
            <a href="#pricing" className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Pricing</a>
            <Link to="/login" className="text-xs font-medium" style={{ color: 'var(--primary)' }}>Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
