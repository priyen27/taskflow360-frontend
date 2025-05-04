import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { projectsApi } from '../../services/api';
import axios from 'axios';

// Async thunks
export const getProjects = createAsyncThunk('projects/getAll', async (_, thunkAPI) => {
  try {
    console.log('Fetching projects...');
    const response = await projectsApi.getAll();
    console.log('Projects fetched:', response.data);
    return response.data;
  } catch (err) {
    console.error('Error fetching projects:', err);
    const message = err.response?.data?.message || 'Failed to fetch projects';
    return thunkAPI.rejectWithValue(message);
  }
});

export const createProject = createAsyncThunk('projects/create', async (projectData, thunkAPI) => {
  try {
    const response = await projectsApi.create(projectData);
    return response.data;
  } catch (err) {
    const message = err.response?.data?.message || 'Failed to create project';
    return thunkAPI.rejectWithValue(message);
  }
});

export const updateProject = createAsyncThunk('projects/update', async ({ id, data }, thunkAPI) => {
  try {
    const response = await projectsApi.update(id, data);
    return response.data;
  } catch (err) {
    const message = err.response?.data?.message || 'Failed to update project';
    return thunkAPI.rejectWithValue(message);
  }
});

export const deleteProject = createAsyncThunk('projects/delete', async (id, thunkAPI) => {
  try {
    await projectsApi.delete(id);
    return id;
  } catch (err) {
    const message = err.response?.data?.message || 'Failed to delete project';
    return thunkAPI.rejectWithValue(message);
  }
});

export const getProjectMembers = createAsyncThunk(
  'projects/getProjectMembers',
  async (projectId, thunkAPI) => {
    try {
      const response = await projectsApi.getMembers(projectId);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch project members');
    }
  }
);

export const inviteUserToProject = createAsyncThunk(
  'projects/inviteUser',
  async ({ projectId, email, role }, thunkAPI) => {
    try {
      const response = await projectsApi.inviteUser(projectId, { email, role });
      await thunkAPI.dispatch(getProjectMembers(projectId));
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to invite user');
    }
  }
);

const initialState = {
  projects: [],
  selectedProject: null,
  projectMembers: [],
  loading: false,
  error: null,
  inviteStatus: null,
};

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setSelectedProject: (state, action) => {
      state.selectedProject = action.payload;
    },
    clearSelectedProject: (state) => {
      state.selectedProject = null;
    },
    clearInviteStatus: (state) => {
      state.inviteStatus = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Projects
      .addCase(getProjects.pending, (state) => {
        console.log('Projects loading...');
        state.loading = true;
        state.error = null;
      })
      .addCase(getProjects.fulfilled, (state, action) => {
        console.log('Projects loaded successfully');
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(getProjects.rejected, (state, action) => {
        console.log('Projects loading failed:', action.payload);
        state.loading = false;
        state.error = action.payload;
      })
      // Create Project
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects.push(action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Project
      .addCase(updateProject.fulfilled, (state, action) => {
        const index = state.projects.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
      })
      // Delete Project
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter(p => p._id !== action.payload);
        if (state.selectedProject?._id === action.payload) {
          state.selectedProject = null;
        }
      })
      // Get Project Members
      .addCase(getProjectMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProjectMembers.fulfilled, (state, action) => {
        state.projectMembers = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getProjectMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Invite User
      .addCase(inviteUserToProject.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.inviteStatus = 'pending';
      })
      .addCase(inviteUserToProject.fulfilled, (state) => {
        state.loading = false;
        state.inviteStatus = 'success';
      })
      .addCase(inviteUserToProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.inviteStatus = 'failed';
      });
  },
});

export const { setSelectedProject, clearSelectedProject, clearInviteStatus } = projectSlice.actions;
export default projectSlice.reducer; 