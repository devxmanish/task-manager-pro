import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Sidebar from './Sidebar'
import { Menu, Bell } from 'lucide-react'
import useWebSocket from '../../hooks/useWebSocket'
import { fetchNotifications } from '../../features/notifications/notificationSlice'

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024)
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { unreadCount } = useSelector((state) => state.notifications)

  // Fetch notifications on mount
  useEffect(() => { dispatch(fetchNotifications()) }, [dispatch])

  // Central WebSocket connection — handles notifications + live data refresh
  useWebSocket()

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-main)' }}>
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div
        className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}
      >
        {/* Top bar */}
        <header
          className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 lg:px-6"
          style={{
            background: 'var(--bg-card)',
            borderBottom: '1px solid var(--border)',
            backdropFilter: 'blur(12px)'
          }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
          >
            <Menu size={20} style={{ color: 'var(--text-main)' }} />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell size={20} style={{ color: 'var(--text-muted)' }} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
            >
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6 animate-fadeIn">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
