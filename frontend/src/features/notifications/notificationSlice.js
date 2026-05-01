import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'
import { getErrorMessage } from '../../utils/errorUtils'

export const fetchNotifications = createAsyncThunk('notifications/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/api/notifications')
    return res.data.data
  } catch (err) { return rejectWithValue(getErrorMessage(err, 'Failed to fetch notifications')) }
})

export const markAsRead = createAsyncThunk('notifications/markRead', async (id, { rejectWithValue }) => {
  try {
    await api.patch(`/api/notifications/${id}/read`)
    return id
  } catch (err) { return rejectWithValue(getErrorMessage(err, 'Failed to mark as read')) }
})

export const markAllRead = createAsyncThunk('notifications/markAllRead', async (_, { rejectWithValue }) => {
  try {
    await api.patch('/api/notifications/read-all')
    return true
  } catch (err) { return rejectWithValue(getErrorMessage(err, 'Failed to mark all as read')) }
})

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { list: [], unreadCount: 0, loading: false },
  reducers: {
    addRealtimeNotification(state, action) {
      state.list.unshift(action.payload)
      state.unreadCount += 1
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.list = action.payload.notifications
        state.unreadCount = action.payload.unreadCount
        state.loading = false
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notif = state.list.find(n => n.id === action.payload)
        if (notif && !notif.isRead) { notif.isRead = true; state.unreadCount = Math.max(0, state.unreadCount - 1) }
      })
      .addCase(markAllRead.fulfilled, (state) => {
        state.list.forEach(n => { n.isRead = true })
        state.unreadCount = 0
      })
  }
})

export const { addRealtimeNotification } = notificationSlice.actions
export default notificationSlice.reducer
