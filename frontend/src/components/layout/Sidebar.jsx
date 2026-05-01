import { NavLink, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../features/auth/authSlice'
import {
  LayoutDashboard, FolderKanban, ListTodo,
  Bell, LogOut, Users, ChevronLeft, Menu
} from 'lucide-react'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/projects', label: 'Projects', icon: FolderKanban },
  { path: '/tasks', label: 'My Tasks', icon: ListTodo },
  { path: '/team', label: 'Team', icon: Users },
  { path: '/notifications', label: 'Notifications', icon: Bell }
]

export default function Sidebar({ isOpen, onToggle }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { unreadCount } = useSelector((state) => state.notifications)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-50 flex flex-col transition-all duration-300 ease-in-out
          ${isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:translate-x-0 lg:w-20'}`}
        style={{
          background: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 h-16">
          <div className={`flex items-center gap-2 overflow-hidden ${!isOpen && 'lg:justify-center'}`}>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
            >
              <FolderKanban size={18} color="white" />
            </div>
            {isOpen && (
              <span className="font-bold text-sm whitespace-nowrap" style={{ color: 'var(--text-main)' }}>
                TaskManager
              </span>
            )}
          </div>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 hidden lg:block"
          >
            <ChevronLeft
              size={18}
              style={{ color: 'var(--text-muted)', transform: isOpen ? 'none' : 'rotate(180deg)', transition: 'transform 0.2s' }}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => window.innerWidth < 1024 && onToggle()}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                ${isActive
                  ? 'text-white shadow-md'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                } ${!isOpen && 'lg:justify-center lg:px-0'}`
              }
              style={({ isActive }) => ({
                background: isActive ? 'linear-gradient(135deg, var(--primary), var(--accent))' : undefined,
                color: isActive ? '#fff' : 'var(--text-soft)'
              })}
            >
              <item.icon size={20} className="flex-shrink-0" />
              {isOpen && <span>{item.label}</span>}
              {item.label === 'Notifications' && unreadCount > 0 && isOpen && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User card */}
        <div
          className="mx-3 mb-3 p-3 rounded-xl"
          style={{ background: 'var(--bg-main)', border: '1px solid var(--border)' }}
        >
          <div className={`flex items-center gap-3 ${!isOpen && 'lg:justify-center'}`}>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
            >
              {getInitials(user?.name)}
            </div>
            {isOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-main)' }}>
                  {user?.name}
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                  {user?.role}
                </p>
              </div>
            )}
            {isOpen && (
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title="Logout"
              >
                <LogOut size={16} className="text-red-500" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
