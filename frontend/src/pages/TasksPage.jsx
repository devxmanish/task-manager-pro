import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { StatusBadge, PriorityBadge } from '../components/ui/Badges'
import { ListTodo, Search } from 'lucide-react'
import api from '../services/api'

export default function TasksPage() {
  const { user } = useSelector((state) => state.auth)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')

  useEffect(() => {
    // single API call instead of N+1
    api.get('/api/tasks')
      .then(res => setTasks(res.data.data || []))
      .catch(err => console.error('Failed to fetch tasks:', err))
      .finally(() => setLoading(false))
  }, [])

  const filtered = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 rounded-lg" style={{ background: 'var(--border)' }} />
      {[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-xl" style={{ background: 'var(--border)' }} />)}
    </div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>All Tasks</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{filtered.length} tasks found</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input type="text" className="input-field pl-10" placeholder="Search tasks..." value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input-field w-auto" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="ALL">All Status</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="IN_REVIEW">In Review</option>
          <option value="DONE">Done</option>
        </select>
      </div>

      {/* Task List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 glass-card">
          <ListTodo size={48} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p className="font-semibold" style={{ color: 'var(--text-main)' }}>No tasks found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(task => (
            <div key={task.id} className="glass-card !py-3 flex items-center gap-4 flex-wrap animate-fadeIn">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-main)' }}>{task.title}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{task.projectName}</p>
              </div>
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {task.assignedToName || 'Unassigned'}
              </span>
              {task.dueDate && (
                <span className="text-xs" style={{ color: new Date(task.dueDate) < new Date() && task.status !== 'DONE' ? 'var(--danger)' : 'var(--text-muted)' }}>
                  {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
