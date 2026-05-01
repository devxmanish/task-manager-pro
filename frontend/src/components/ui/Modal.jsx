import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children, maxWidth = '480px' }) {
  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="glass-card animate-fadeIn mx-4"
        style={{ width: '100%', maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={18} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
