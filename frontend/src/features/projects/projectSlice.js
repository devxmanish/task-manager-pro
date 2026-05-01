import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'
import { getErrorMessage } from '../../utils/errorUtils'

export const fetchProjects = createAsyncThunk('projects/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/api/projects')
    return res.data.data
  } catch (err) { return rejectWithValue(getErrorMessage(err, 'Failed to fetch projects')) }
})

export const fetchProjectById = createAsyncThunk('projects/fetchById', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/api/projects/${id}`)
    return res.data.data
  } catch (err) { return rejectWithValue(getErrorMessage(err, 'Failed to fetch project')) }
})

export const createProject = createAsyncThunk('projects/create', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/api/projects', data)
    return res.data.data
  } catch (err) { return rejectWithValue(getErrorMessage(err, 'Failed to create project')) }
})

export const updateProject = createAsyncThunk('projects/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/api/projects/${id}`, data)
    return res.data.data
  } catch (err) { return rejectWithValue(getErrorMessage(err, 'Failed to update project')) }
})

export const deleteProject = createAsyncThunk('projects/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/api/projects/${id}`)
    return id
  } catch (err) { return rejectWithValue(getErrorMessage(err, 'Failed to delete project')) }
})

export const addMember = createAsyncThunk('projects/addMember', async ({ projectId, userId }, { rejectWithValue }) => {
  try {
    await api.post(`/api/projects/${projectId}/members`, { userId })
    return { projectId, userId }
  } catch (err) { return rejectWithValue(getErrorMessage(err, 'Failed to add member')) }
})

export const removeMember = createAsyncThunk('projects/removeMember', async ({ projectId, userId }, { rejectWithValue }) => {
  try {
    await api.delete(`/api/projects/${projectId}/members/${userId}`)
    return { projectId, userId }
  } catch (err) { return rejectWithValue(getErrorMessage(err, 'Failed to remove member')) }
})

const projectSlice = createSlice({
  name: 'projects',
  initialState: {
    list: [],
    currentProject: null,
    loading: false,
    error: null
  },
  reducers: {
    clearProjectError(state) { state.error = null }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => { state.loading = true })
      .addCase(fetchProjects.fulfilled, (state, action) => { state.loading = false; state.list = action.payload })
      .addCase(fetchProjects.rejected, (state, action) => { state.loading = false; state.error = action.payload })

      .addCase(fetchProjectById.pending, (state) => { state.loading = true })
      .addCase(fetchProjectById.fulfilled, (state, action) => { state.loading = false; state.currentProject = action.payload })
      .addCase(fetchProjectById.rejected, (state, action) => { state.loading = false; state.error = action.payload })

      .addCase(createProject.fulfilled, (state, action) => { state.list.push(action.payload) })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.list = state.list.filter(p => p.id !== action.payload)
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        const idx = state.list.findIndex(p => p.id === action.payload.id)
        if (idx >= 0) state.list[idx] = action.payload
      })
  }
})

export const { clearProjectError } = projectSlice.actions
export default projectSlice.reducer
