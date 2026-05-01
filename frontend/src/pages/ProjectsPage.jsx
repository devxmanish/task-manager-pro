import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchProjects, createProject, deleteProject } from '../features/projects/projectSlice'
import Modal from '../components/ui/Modal'
import { Plus, FolderKanban, Users, ListTodo, Trash2 } from 'lucide-react'

export default function ProjectsPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { list: projects, loading } = useSelector((state) => state.projects)
  const { user } = useSelector((state) => state.auth)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '' })

  const isAdmin = user?.role === 'ADMIN'

  useEffect(() => { dispatch(fetchProjects()) }, [dispatch])

  const handleCreate = (e) => {
    e.preventDefault()
    dispatch(createProject(formData)).then((res) => {
      if (!res.error) {
        setShowModal(false)
        setFormData({ name: '', description: '' })
      }
    })
  }

  const handleDelete = (e, id) => {
    e.stopPropagation()
    if (window.confirm('Delete this project and all its tasks?')) {
      dispatch(deleteProject(id))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>Projects</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> New Project
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-card h-40 animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 glass-card">
          <FolderKanban size={48} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p className="font-semibold" style={{ color: 'var(--text-main)' }}>No projects yet</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {isAdmin ? 'Create your first project to get started' : 'Ask an admin to add you to a project'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="glass-card cursor-pointer hover:scale-[1.01] transition-transform"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
                >
                  <FolderKanban size={20} color="white" />
                </div>
                {isAdmin && (
                  <button
                    onClick={(e) => handleDelete(e, project.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                )}
              </div>
              <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--text-main)' }}>{project.name}</h3>
              <p className="text-sm line-clamp-2 mb-4" style={{ color: 'var(--text-muted)' }}>
                {project.description || 'No description'}
              </p>
              <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span className="flex items-center gap-1"><Users size={14} /> {project.memberCount} members</span>
                <span className="flex items-center gap-1"><ListTodo size={14} /> {project.taskCount} tasks</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Project">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-soft)' }}>Project Name</label>
            <input type="text" className="input-field" placeholder="e.g. Mobile App Redesign" value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-soft)' }}>Description</label>
            <textarea className="input-field" rows={3} placeholder="Brief project description..." value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary w-full">Create Project</button>
        </form>
      </Modal>
    </div>
  )
}
