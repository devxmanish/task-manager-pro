import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import projectReducer from '../features/projects/projectSlice'
import taskReducer from '../features/tasks/taskSlice'
import dashboardReducer from '../features/dashboard/dashboardSlice'
import notificationReducer from '../features/notifications/notificationSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectReducer,
    tasks: taskReducer,
    dashboard: dashboardReducer,
    notifications: notificationReducer
  }
})

export default store
