import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'
import { getErrorMessage } from '../../utils/errorUtils'

export const fetchDashboardStats = createAsyncThunk('dashboard/fetchStats', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/api/dashboard/stats')
    return res.data.data
  } catch (err) { return rejectWithValue(getErrorMessage(err, 'Failed to fetch stats')) }
})

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: { stats: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => { state.loading = true })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => { state.loading = false; state.stats = action.payload })
      .addCase(fetchDashboardStats.rejected, (state, action) => { state.loading = false; state.error = action.payload })
  }
})

export default dashboardSlice.reducer
