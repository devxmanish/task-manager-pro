import { useEffect, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addRealtimeNotification, fetchNotifications } from '../features/notifications/notificationSlice'
import { fetchProjects, fetchProjectById } from '../features/projects/projectSlice'
import { fetchProjectTasks, fetchAllUserTasks } from '../features/tasks/taskSlice'
import { fetchDashboardStats } from '../features/dashboard/dashboardSlice'

/**
 * Central WebSocket hook — manages STOMP connection and auto-refetches
 * data when events arrive. Subscribes to:
 *   1. /topic/notifications/{userId}   → real-time notification bell
 *   2. /topic/org/{orgId}/events       → data-change events (tasks, projects, members)
 */
export default function useWebSocket() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const stompRef = useRef(null)
  const currentProjectRef = useRef(null)

  // Keep currentProject ref in sync without causing re-connections
  const { currentProject } = useSelector((state) => state.projects)
  useEffect(() => {
    currentProjectRef.current = currentProject
  }, [currentProject])

  const handleOrgEvent = useCallback((event) => {
    // Don't skip self events — the actor also needs UI updates
    // (Redux thunk fulfilled already handles optimistic updates,
    //  but a fresh fetch ensures consistency with the server)
    console.log('[WS] Org event:', event.event, event)

    switch (event.event) {
      case 'TASK_CREATED':
      case 'TASK_UPDATED':
      case 'TASK_DELETED':
      case 'TASK_STATUS_CHANGED':
      case 'COMMENT_ADDED':
        // Refetch tasks for the relevant project if we're viewing it
        if (event.projectId) {
          dispatch(fetchProjectTasks(event.projectId))
        }
        // Refresh the "My Tasks" page
        dispatch(fetchAllUserTasks())
        // Always refresh dashboard stats
        dispatch(fetchDashboardStats())
        // Refresh notifications
        dispatch(fetchNotifications())
        break

      case 'PROJECT_CREATED':
      case 'PROJECT_UPDATED':
      case 'PROJECT_DELETED':
        dispatch(fetchProjects())
        dispatch(fetchDashboardStats())
        dispatch(fetchNotifications())
        break

      case 'MEMBER_CHANGED':
        dispatch(fetchProjects())
        // Refetch current project detail if we're viewing the affected project
        if (event.projectId && currentProjectRef.current?.id === event.projectId) {
          dispatch(fetchProjectById(event.projectId))
        }
        dispatch(fetchNotifications())
        break

      default:
        console.log('[WS] Unknown event:', event.event)
    }
  }, [dispatch])

  useEffect(() => {
    if (!user?.userId) return

    let stompClient = null
    let isActive = true

    const connectWebSocket = async () => {
      try {
        const SockJS = (await import('sockjs-client')).default
        const { Client } = await import('@stomp/stompjs')

        if (!isActive) return

        // Determine the WebSocket URL
        // In dev mode (Vite), relative URL goes through Vite proxy
        // In prod, relative URL goes to the same server
        const wsUrl = (import.meta.env.VITE_API_URL || '') + '/ws'

        stompClient = new Client({
          webSocketFactory: () => new SockJS(wsUrl),
          reconnectDelay: 5000,
          heartbeatIncoming: 10000,
          heartbeatOutgoing: 10000,
          debug: (msg) => {
            // Only log important STOMP messages, not heartbeats
            if (msg.includes('CONNECTED') || msg.includes('SUBSCRIBE') || msg.includes('ERROR')) {
              console.log('[WS STOMP]', msg)
            }
          },
          onConnect: () => {
            console.log('[WS] ✅ Connected as user', user.userId, 'org', user.organizationId)

            // 1. Subscribe to user-specific notifications
            stompClient.subscribe(`/topic/notifications/${user.userId}`, (message) => {
              try {
                const notification = JSON.parse(message.body)
                dispatch(addRealtimeNotification(notification))
              } catch (e) {
                console.warn('[WS] Failed to parse notification:', e)
              }
            })

            // 2. Subscribe to org-wide events
            if (user.organizationId) {
              stompClient.subscribe(`/topic/org/${user.organizationId}/events`, (message) => {
                try {
                  const event = JSON.parse(message.body)
                  handleOrgEvent(event)
                } catch (e) {
                  console.warn('[WS] Failed to parse event:', e)
                }
              })
              console.log('[WS] ✅ Subscribed to org events: /topic/org/' + user.organizationId + '/events')
            } else {
              console.warn('[WS] ⚠️ No organizationId — skipping org event subscription')
            }
          },
          onStompError: (frame) => {
            console.error('[WS] STOMP error:', frame.headers?.message)
          },
          onWebSocketClose: () => {
            console.log('[WS] WebSocket closed, will auto-reconnect...')
          }
        })

        stompClient.activate()
        stompRef.current = stompClient
      } catch (err) {
        console.error('[WS] Connection failed:', err)
      }
    }

    connectWebSocket()

    return () => {
      isActive = false
      if (stompClient) {
        stompClient.deactivate()
        console.log('[WS] Disconnected')
      }
    }
  }, [user?.userId, user?.organizationId, dispatch, handleOrgEvent])

  return stompRef
}
