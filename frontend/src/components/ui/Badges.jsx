const statusConfig = {
  TODO: { label: 'To Do', className: 'badge-todo' },
  IN_PROGRESS: { label: 'In Progress', className: 'badge-in-progress' },
  IN_REVIEW: { label: 'In Review', className: 'badge-in-review' },
  DONE: { label: 'Done', className: 'badge-done' }
}

const priorityConfig = {
  LOW: { label: 'Low', className: 'badge-low' },
  MEDIUM: { label: 'Medium', className: 'badge-medium' },
  HIGH: { label: 'High', className: 'badge-high' },
  URGENT: { label: 'Urgent', className: 'badge-urgent' }
}

export function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig.TODO
  return <span className={`badge ${cfg.className}`}>{cfg.label}</span>
}

export function PriorityBadge({ priority }) {
  const cfg = priorityConfig[priority] || priorityConfig.MEDIUM
  return <span className={`badge ${cfg.className}`}>{cfg.label}</span>
}
