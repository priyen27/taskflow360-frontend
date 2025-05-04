import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { tasksApi } from '../../services/api';

// Async thunks
export const getTasksByProject = createAsyncThunk('tasks/getByProject', async (projectId, thunkAPI) => {
  try {
    const response = await tasksApi.getByProject(projectId);
    return response.data;
  } catch (err) {
    const message = err.response?.data?.message || 'Failed to fetch tasks';
    return thunkAPI.rejectWithValue(message);
  }
});

export const createTask = createAsyncThunk('tasks/create', async (taskData, thunkAPI) => {
  try {
    const response = await tasksApi.create(taskData);
    return response.data;
  } catch (err) {
    const message = err.response?.data?.message || 'Failed to create task';
    return thunkAPI.rejectWithValue(message);
  }
});

export const updateTask = createAsyncThunk('tasks/update', async ({ id, data }, thunkAPI) => {
  try {
    const response = await tasksApi.update(id, data);
    return response.data;
  } catch (err) {
    const message = err.response?.data?.message || 'Failed to update task';
    return thunkAPI.rejectWithValue(message);
  }
});

export const deleteTask = createAsyncThunk('tasks/delete', async (id, thunkAPI) => {
  try {
    await tasksApi.delete(id);
    return id;
  } catch (err) {
    const message = err.response?.data?.message || 'Failed to delete task';
    return thunkAPI.rejectWithValue(message);
  }
});

const initialState = {
  tasks: [],
  loading: false,
  error: null,
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearTasks: (state) => {
      state.tasks = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Tasks
      .addCase(getTasksByProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTasksByProject.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(getTasksByProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Task
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.push(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Task
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      // Delete Task
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(t => t._id !== action.payload);
      });
  },
});

export const { clearTasks } = taskSlice.actions;
export default taskSlice.reducer; 