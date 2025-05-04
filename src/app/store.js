import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../redux/auth/authSlice';
import projectReducer from '../redux/projects/projectSlice';
import taskReducer from '../redux/tasks/taskSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectReducer,
    tasks: taskReducer,
  },
});
