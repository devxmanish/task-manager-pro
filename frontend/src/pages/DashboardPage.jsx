import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDashboardStats } from '../features/dashboard/dashboardSlice'
import { StatusBadge, PriorityBadge } from '../components/ui/Badges'
import StatCard from '../components/ui/StatCard'
import { FolderKanban, ListTodo, Clock, CheckCircle, AlertTriangle, Users } from 'lucide-react'

export default function DashboardPage() {
  const dispatch = useDispatch()
  const { stats, loading } = useSelector((state) => state.dashboard)
  const { user } = useSelector((state) => state.auth)

  useEffect(() => {
    dispatch(fetchDashboardStats())
  }, [dispatch])

  if (loading || !stats) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 rounded-lg" style={{ background: 'var(--border)' }} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card h-24" />
          ))}
        </div>
      </div>
    )
  }

  const statusCounts = stats.tasksByStatus || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Here's your task overview for today
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FolderKanban} label="Total Projects" value={stats.totalProjects || 0} color="var(--primary)" />
        <StatCard icon={ListTodo} label="Total Tasks" value={stats.totalTasks || 0} color="var(--info)" />
        <StatCard icon={Clock} label="In Progress" value={statusCounts.IN_PROGRESS || 0} color="var(--warning)" />
        <StatCard icon={AlertTriangle} label="Overdue" value={stats.overdueCount || 0} color="var(--danger)" />
      </div>

      {/* Status Breakdown + Overdue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Breakdown */}
        <div className="glass-card">
          <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-main)' }}>Task Status</h2>
          <div className="space-y-3">
            {Object.entries(statusCounts).map(([status, count]) => {
              const total = stats.totalTasks || 1
              const pct = Math.round((count / total) * 100)
              const colors = { TODO: '#94a3b8', IN_PROGRESS: '#3b82f6', IN_REVIEW: '#f59e0b', DONE: '#22c55e' }
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <StatusBadge status={status} />
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>{count}</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: 'var(--border)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: colors[status] || 'var(--primary)' }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Overdue Tasks */}
        <div className="glass-card">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
            <AlertTriangle size={20} className="text-red-500" />
            Overdue Tasks
          </h2>
          {stats.overdueTasks && stats.overdueTasks.length > 0 ? (
            <div className="space-y-3">
              {stats.overdueTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: 'var(--bg-main)', border: '1px solid var(--border)' }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-main)' }}>{task.title}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{task.projectName}</p>
                  </div>
                  <span className="text-xs font-medium text-red-500 ml-3 flex-shrink-0">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle size={40} className="mx-auto mb-2 text-green-400" />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No overdue tasks! 🎉</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="glass-card">
        <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-main)' }}>Recent Activity</h2>
        {stats.recentTasks && stats.recentTasks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th className="text-left py-2.5 font-semibold" style={{ color: 'var(--text-muted)' }}>Task</th>
                  <th className="text-left py-2.5 font-semibold" style={{ color: 'var(--text-muted)' }}>Project</th>
                  <th className="text-left py-2.5 font-semibold" style={{ color: 'var(--text-muted)' }}>Status</th>
                  <th className="text-left py-2.5 font-semibold" style={{ color: 'var(--text-muted)' }}>Priority</th>
                  <th className="text-left py-2.5 font-semibold" style={{ color: 'var(--text-muted)' }}>Assignee</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentTasks.map((task) => (
                  <tr key={task.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="py-2.5 font-medium" style={{ color: 'var(--text-main)' }}>{task.title}</td>
                    <td className="py-2.5" style={{ color: 'var(--text-soft)' }}>{task.projectName}</td>
                    <td className="py-2.5"><StatusBadge status={task.status} /></td>
                    <td className="py-2.5"><PriorityBadge priority={task.priority} /></td>
                    <td className="py-2.5" style={{ color: 'var(--text-soft)' }}>{task.assignedToName || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>No tasks yet. Create your first project!</p>
        )}
      </div>
    </div>
  )
}
