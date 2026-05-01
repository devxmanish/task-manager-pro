import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'
import { getErrorMessage } from '../../utils/errorUtils'

// ── Thunks ──

export const initiateSignup = createAsyncThunk(
  'auth/initiateSignup',
  async (signupData, { rejectWithValue }) => {
    try {
      const res = await api.post('/api/auth/signup', signupData)
      return res.data.data
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Signup failed'))
    }
  }
)

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async (otpData, { rejectWithValue }) => {
    try {
      const res = await api.post('/api/auth/verify-otp', otpData)
      const authData = res.data.data
      localStorage.setItem('token', authData.token)
      localStorage.setItem('user', JSON.stringify(authData))
      return authData
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'OTP verification failed'))
    }
  }
)

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await api.post('/api/auth/login', credentials)
      const authData = res.data.data
      localStorage.setItem('token', authData.token)
      localStorage.setItem('user', JSON.stringify(authData))
      return authData
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Login failed'))
    }
  }
)

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/api/auth/me')
      return res.data.data
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Failed to fetch user'))
    }
  }
)

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (emailData, { rejectWithValue }) => {
    try {
      const res = await api.post('/api/auth/forgot-password', emailData)
      return res.data.message
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Failed to send reset email'))
    }
  }
)

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (resetData, { rejectWithValue }) => {
    try {
      const res = await api.post('/api/auth/reset-password', resetData)
      return res.data.message
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Password reset failed'))
    }
  }
)

// ── Slice ──

const savedUser = localStorage.getItem('user')

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: savedUser ? JSON.parse(savedUser) : null,
    token: localStorage.getItem('token') || null,
    verificationToken: null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,
    message: null
  },
  reducers: {
    logout(state) {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.verificationToken = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
    clearError(state) {
      state.error = null
    },
    clearMessage(state) {
      state.message = null
    }
  },
  extraReducers: (builder) => {
    // signup
    builder.addCase(initiateSignup.pending, (state) => { state.loading = true; state.error = null })
    builder.addCase(initiateSignup.fulfilled, (state, action) => {
      state.loading = false
      state.verificationToken = action.payload.verificationToken
    })
    builder.addCase(initiateSignup.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload
    })

    // verify otp
    builder.addCase(verifyOtp.pending, (state) => { state.loading = true; state.error = null })
    builder.addCase(verifyOtp.fulfilled, (state, action) => {
      state.loading = false
      state.user = action.payload
      state.token = action.payload.token
      state.isAuthenticated = true
      state.verificationToken = null
    })
    builder.addCase(verifyOtp.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload
    })

    // login
    builder.addCase(login.pending, (state) => { state.loading = true; state.error = null })
    builder.addCase(login.fulfilled, (state, action) => {
      state.loading = false
      state.user = action.payload
      state.token = action.payload.token
      state.isAuthenticated = true
    })
    builder.addCase(login.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload
    })

    // forgot password
    builder.addCase(forgotPassword.pending, (state) => { state.loading = true; state.error = null })
    builder.addCase(forgotPassword.fulfilled, (state, action) => {
      state.loading = false
      state.message = action.payload
    })
    builder.addCase(forgotPassword.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload
    })

    // reset password
    builder.addCase(resetPassword.pending, (state) => { state.loading = true; state.error = null })
    builder.addCase(resetPassword.fulfilled, (state, action) => {
      state.loading = false
      state.message = action.payload
    })
    builder.addCase(resetPassword.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload
    })
  }
})

export const { logout, clearError, clearMessage } = authSlice.actions
export default authSlice.reducer
