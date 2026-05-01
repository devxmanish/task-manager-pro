export default function StatCard({ icon: Icon, label, value, color, trend }) {
  return (
    <div className="glass-card flex items-center gap-4">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}15`, color }}
      >
        <Icon size={24} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</p>
        <p className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>{value}</p>
        {trend && (
          <p className="text-xs mt-0.5" style={{ color: trend > 0 ? 'var(--success)' : 'var(--danger)' }}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last week
          </p>
        )}
      </div>
    </div>
  )
}
