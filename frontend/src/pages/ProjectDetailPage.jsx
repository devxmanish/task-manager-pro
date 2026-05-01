import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProjectById, addMember, removeMember } from '../features/projects/projectSlice'
import { fetchProjectTasks, createTask, updateTaskStatus, deleteTask } from '../features/tasks/taskSlice'
import { StatusBadge, PriorityBadge } from '../components/ui/Badges'
import Modal from '../components/ui/Modal'
import { Plus, UserPlus, UserMinus, Trash2, Calendar, MessageSquare } from 'lucide-react'
import api from '../services/api'

const COLUMNS = [
  { key: 'TODO', label: 'To Do', color: '#94a3b8' },
  { key: 'IN_PROGRESS', label: 'In Progress', color: '#3b82f6' },
  { key: 'IN_REVIEW', label: 'In Review', color: '#f59e0b' },
  { key: 'DONE', label: 'Done', color: '#22c55e' }
]

export default function ProjectDetailPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { currentProject, loading: projLoading } = useSelector((state) => state.projects)
  const { list: tasks } = useSelector((state) => state.tasks)
  const { user } = useSelector((state) => state.auth)
  const isAdmin = user?.role === 'ADMIN'

  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [allUsers, setAllUsers] = useState([])
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'MEDIUM', assignedTo: '', dueDate: '' })

  useEffect(() => {
    dispatch(fetchProjectById(id))
    dispatch(fetchProjectTasks(id))
  }, [dispatch, id])

  useEffect(() => {
    if (showMemberModal) {
      api.get('/api/users').then(res => setAllUsers(res.data.data || []))
    }
  }, [showMemberModal])

  const handleCreateTask = (e) => {
    e.preventDefault()
    const data = {
      title: taskForm.title,
      description: taskForm.description,
      priority: taskForm.priority,
      assignedTo: taskForm.assignedTo ? Number(taskForm.assignedTo) : null,
      dueDate: taskForm.dueDate || null
    }
    dispatch(createTask({ projectId: id, data })).then((res) => {
      if (!res.error) {
        setShowTaskModal(false)
        setTaskForm({ title: '', description: '', priority: 'MEDIUM', assignedTo: '', dueDate: '' })
      }
    })
  }

  const handleStatusChange = (taskId, newStatus) => {
    dispatch(updateTaskStatus({ taskId, status: newStatus }))
  }

  const handleAddMember = (userId) => {
    dispatch(addMember({ projectId: id, userId })).then(() => dispatch(fetchProjectById(id)))
  }

  const handleRemoveMember = (userId) => {
    dispatch(removeMember({ projectId: id, userId })).then(() => dispatch(fetchProjectById(id)))
  }

  if (projLoading || !currentProject) {
    return <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 rounded-lg" style={{ background: 'var(--border)' }} />
      <div className="h-64 rounded-xl" style={{ background: 'var(--border)' }} />
    </div>
  }

  const memberIds = (currentProject.members || []).map(m => m.id)
  const nonMembers = allUsers.filter(u => u.id !== currentProject.ownerId && !memberIds.includes(u.id))

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>{currentProject.name}</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{currentProject.description || 'No description'}</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button className="btn-secondary" onClick={() => setShowMemberModal(true)}>
              <UserPlus size={16} /> Members
            </button>
          )}
          <button className="btn-primary" onClick={() => setShowTaskModal(true)}>
            <Plus size={16} /> Add Task
          </button>
        </div>
      </div>

      {/* Members bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Team:</span>
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-white"
          style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
          title={currentProject.ownerName + ' (Owner)'}
        >
          {currentProject.ownerName?.charAt(0)?.toUpperCase()}
        </div>
        {(currentProject.members || []).map(m => (
          <div key={m.id}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-white"
            style={{ background: '#64748b' }}
            title={m.name}
          >
            {m.name?.charAt(0)?.toUpperCase()}
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const columnTasks = tasks.filter(t => t.status === col.key)
          return (
            <div key={col.key} className="rounded-xl p-3" style={{ background: 'var(--bg-main)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: col.color }} />
                <span className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>{col.label}</span>
                <span className="text-xs px-1.5 py-0.5 rounded-md ml-auto" style={{ background: 'var(--border)', color: 'var(--text-muted)' }}>
                  {columnTasks.length}
                </span>
              </div>

              <div className="space-y-2 min-h-[100px]">
                {columnTasks.map(task => (
                  <div key={task.id} className="glass-card !p-3 animate-fadeIn">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-semibold flex-1 mr-2" style={{ color: 'var(--text-main)' }}>{task.title}</p>
                      <button onClick={() => dispatch(deleteTask(task.id))} className="flex-shrink-0 p-1 rounded hover:bg-red-50">
                        <Trash2 size={12} className="text-red-400" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <PriorityBadge priority={task.priority} />
                      {task.dueDate && (
                        <span className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                          <Calendar size={10} /> {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      {task.assignedToName ? (
                        <span className="text-[11px] font-medium" style={{ color: 'var(--text-soft)' }}>
                          → {task.assignedToName}
                        </span>
                      ) : <span />}
                      <select
                        className="text-[11px] p-1 rounded-md border-none outline-none cursor-pointer"
                        style={{ background: 'var(--bg-main)', color: 'var(--text-muted)' }}
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      >
                        {COLUMNS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                      </select>
                    </div>
                    {task.commentCount > 0 && (
                      <span className="flex items-center gap-1 text-[11px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
                        <MessageSquare size={10} /> {task.commentCount}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Create Task Modal */}
      <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title="Create Task" maxWidth="520px">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-soft)' }}>Title</label>
            <input type="text" className="input-field" placeholder="Task title" value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-soft)' }}>Description</label>
            <textarea className="input-field" rows={2} placeholder="Optional description" value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-soft)' }}>Priority</label>
              <select className="input-field" value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-soft)' }}>Due Date</label>
              <input type="date" className="input-field" value={taskForm.dueDate}
                onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-soft)' }}>Assign To</label>
            <select className="input-field" value={taskForm.assignedTo}
              onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}>
              <option value="">Unassigned</option>
              <option value={currentProject.ownerId}>{currentProject.ownerName} (Owner)</option>
              {(currentProject.members || []).map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-primary w-full">Create Task</button>
        </form>
      </Modal>

      {/* Members Modal */}
      <Modal isOpen={showMemberModal} onClose={() => setShowMemberModal(false)} title="Manage Members" maxWidth="420px">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-main)' }}>Current Members</h4>
            {(currentProject.members || []).length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No members yet</p>
            ) : (
              <div className="space-y-2">
                {(currentProject.members || []).map(m => (
                  <div key={m.id} className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'var(--bg-main)' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-bold">
                        {m.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>{m.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{m.email}</p>
                      </div>
                    </div>
                    <button onClick={() => handleRemoveMember(m.id)} className="p-1 rounded hover:bg-red-50">
                      <UserMinus size={14} className="text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {nonMembers.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-main)' }}>Add Members</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {nonMembers.map(u => (
                  <div key={u.id} className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'var(--bg-main)' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs font-bold">
                        {u.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="text-sm" style={{ color: 'var(--text-main)' }}>{u.name}</span>
                    </div>
                    <button onClick={() => handleAddMember(u.id)} className="btn-primary !py-1 !px-2.5 !text-xs">
                      <UserPlus size={12} /> Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
