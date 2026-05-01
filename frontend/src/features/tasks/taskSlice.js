import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'
import { getErrorMessage } from '../../utils/errorUtils'

export const fetchProjectTasks = createAsyncThunk('tasks/fetchByProject', async (projectId, { rejectWithValue }) => {
  try {
    const res = await api.get(`/api/projects/${projectId}/tasks`)
    return res.data.data
  } catch (err) { return rejectWithValue(getErrorMessage(err, 'Failed to fetch tasks')) }
})

export const fetchAllUserTasks = createAsyncThunk('tasks/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/api/tasks')
    return res.data.data
  } catch (err) { return rejectWithValue(getErrorMessage(err, 'Failed to fetch tasks')) }
})

export const createTask = createAsyncThunk('tasks/create', async ({ projectId, data }, { rejectWithValue }) => {
  try {
    const res = await api.post(`/api/projects/${projectId}/tasks`, data)
    return res.data.data
  } catch (err) { return rejectWithValue(getErrorMessage(err, 'Failed to create task')) }
})

export const updateTask = createAsyncThunk('tasks/update', async ({ taskId, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/api/tasks/${taskId}`, data)
    return res.data.data
  } catch (err) { return rejectWithValue(getErrorMessage(err, 'Failed to update task')) }
})

export const updateTaskStatus = createAsyncThunk('tasks/updateStatus', async ({ taskId, status }, { rejectWithValue }) => {
  try {
    await api.patch(`/api/tasks/${taskId}/status`, { status })
    return { taskId, status }
  } catch (err) { return rejectWithValue(getErrorMessage(err, 'Failed to update status')) }
})

export const deleteTask = createAsyncThunk('tasks/delete', async (taskId, { rejectWithValue }) => {
  try {
    await api.delete(`/api/tasks/${taskId}`)
    return taskId
  } catch (err) { return rejectWithValue(getErrorMessage(err, 'Failed to delete task')) }
})

export const addComment = createAsyncThunk('tasks/addComment', async ({ taskId, content }, { rejectWithValue }) => {
  try {
    const res = await api.post(`/api/tasks/${taskId}/comments`, { content })
    return { taskId, comment: res.data.data }
  } catch (err) { return rejectWithValue(getErrorMessage(err, 'Failed to add comment')) }
})

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    list: [],
    loading: false,
    error: null
  },
  reducers: {
    clearTasks(state) { state.list = [] },
    clearTaskError(state) { state.error = null }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjectTasks.pending, (state) => { state.loading = true })
      .addCase(fetchProjectTasks.fulfilled, (state, action) => { state.loading = false; state.list = action.payload })
      .addCase(fetchProjectTasks.rejected, (state, action) => { state.loading = false; state.error = action.payload })

      .addCase(fetchAllUserTasks.pending, (state) => { state.loading = true })
      .addCase(fetchAllUserTasks.fulfilled, (state, action) => { state.loading = false; state.list = action.payload })
      .addCase(fetchAllUserTasks.rejected, (state, action) => { state.loading = false; state.error = action.payload })

      .addCase(createTask.fulfilled, (state, action) => { state.list.push(action.payload) })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.list = state.list.filter(t => t.id !== action.payload)
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const idx = state.list.findIndex(t => t.id === action.payload.id)
        if (idx >= 0) state.list[idx] = action.payload
      })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        const task = state.list.find(t => t.id === action.payload.taskId)
        if (task) task.status = action.payload.status
      })
  }
})

export const { clearTasks, clearTaskError } = taskSlice.actions
export default taskSlice.reducer
