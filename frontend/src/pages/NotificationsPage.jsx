import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchNotifications, markAsRead, markAllRead } from '../features/notifications/notificationSlice'
import { Bell, CheckCheck, Clock } from 'lucide-react'

const typeIcons = {
  TASK_ASSIGNED: '📋',
  STATUS_CHANGED: '🔄',
  COMMENT_ADDED: '💬',
  MEMBER_ADDED: '👥',
  MEMBER_REMOVED: '🚫',
  DUE_REMINDER: '⏰'
}

export default function NotificationsPage() {
  const dispatch = useDispatch()
  const { list: notifications, unreadCount } = useSelector((state) => state.notifications)

  useEffect(() => { dispatch(fetchNotifications()) }, [dispatch])

  const formatTime = (dateStr) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((now - date) / 1000)
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>Notifications</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button className="btn-secondary" onClick={() => dispatch(markAllRead())}>
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 glass-card">
          <Bell size={48} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p className="font-semibold" style={{ color: 'var(--text-main)' }}>No notifications</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div
              key={n.id}
              className={`glass-card !py-3 flex items-start gap-3 cursor-pointer transition-opacity ${n.isRead ? 'opacity-60' : ''}`}
              onClick={() => !n.isRead && dispatch(markAsRead(n.id))}
            >
              <span className="text-xl flex-shrink-0 mt-0.5">{typeIcons[n.type] || '🔔'}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${n.isRead ? '' : 'font-semibold'}`} style={{ color: 'var(--text-main)' }}>
                  {n.message}
                </p>
                <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                  <Clock size={10} /> {formatTime(n.createdAt)}
                </p>
              </div>
              {!n.isRead && (
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: 'var(--primary)' }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
