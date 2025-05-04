import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout, getProfile } from '../redux/auth/authSlice';
import { getProjects, createProject, setSelectedProject, updateProject, deleteProject, getProjectMembers } from '../redux/projects/projectSlice';
import { getTasksByProject, createTask, updateTask, deleteTask } from '../redux/tasks/taskSlice';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { TASK_STATUS, TASK_STATUS_LABELS, PROJECT_VALIDATION, TASK_VALIDATION } from '../constants/taskConstants';
import TaskCard from '../components/TaskCard';
import ConfirmationModal from '../components/ConfirmationModal';
import UserSettings from '../components/UserSettings';
import Analytics from '../components/Analytics';
import Help from '../components/Help';
import InviteModal from '../components/InviteModal';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export default function Dashboard() {
  const dispatch = useDispatch();
  const projects = useSelector((state) => state.projects.projects);
  const selectedProject = useSelector((state) => state.projects.selectedProject);
  const projectMembers = useSelector((state) => state.projects.projectMembers);
  const projectsLoading = useSelector((state) => state.projects.loading);
  const projectsError = useSelector((state) => state.projects.error);
  const tasks = useSelector((state) => state.tasks.tasks);
  const tasksLoading = useSelector((state) => state.tasks.loading);
  const tasksError = useSelector((state) => state.tasks.error);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: '', description: '' });
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: TASK_STATUS.TODO,
    dueDate: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isUserSettingsOpen, setIsUserSettingsOpen] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [assignee, setAssignee] = useState('');
  const isAdmin = user?.role === 'admin';
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Fetch projects and user profile on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        console.log('Fetching initial data...');
        await dispatch(getProfile()).unwrap();
        const result = await dispatch(getProjects()).unwrap();
        console.log('Projects fetched successfully:', result);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        if (error?.includes('401') || error?.response?.status === 401) {
          console.log('Unauthorized, logging out...');
          dispatch(logout());
        } else {
          toast.error(error || 'Failed to fetch data');
        }
      }
    };

    fetchInitialData();
  }, [dispatch]);

  // Fetch tasks when project is selected
  useEffect(() => {
    if (selectedProject) {
      dispatch(getTasksByProject(selectedProject._id))
        .unwrap()
        .catch((error) => {
          console.error('Error fetching tasks:', error);
          toast.error(error || 'Failed to fetch tasks');
        });
    }
  }, [dispatch, selectedProject]);

  // Fetch project members when project is selected
  useEffect(() => {
    if (selectedProject && isAdmin) {
      dispatch(getProjectMembers(selectedProject._id))
        .unwrap()
        .catch((error) => {
          console.error('Error fetching project members:', error);
          toast.error('Failed to fetch project members');
        });
    }
  }, [selectedProject, isAdmin, dispatch]);

  // Show error states if present
  useEffect(() => {
    if (projectsError) {
      toast.error(`Projects Error: ${projectsError}`);
    }
    if (tasksError) {
      toast.error(`Tasks Error: ${tasksError}`);
    }
  }, [projectsError, tasksError]);

  const validateProjectForm = (data) => {
    const errors = {};
    if (!data.name || data.name.trim().length === 0) {
      errors.name = PROJECT_VALIDATION.name.message;
    }
    return errors;
  };

  const validateTaskForm = (data) => {
    const errors = {};
    if (!data.title || data.title.trim().length === 0) {
      errors.title = TASK_VALIDATION.title.message;
    }
    if (!data.project) {
      errors.project = TASK_VALIDATION.project.message;
    }
    return errors;
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setProjectForm({ name: project.name, description: project.description });
    setIsProjectModalOpen(true);
    setIsEditMode(true);
  };

  const handleDeleteProject = async (projectId) => {
    setProjectToDelete(projectId);
    setIsDeleteConfirmationOpen(true);
  };

  const confirmDeleteProject = async () => {
    try {
      await dispatch(deleteProject(projectToDelete)).unwrap();
      if (selectedProject?._id === projectToDelete) {
        dispatch(setSelectedProject(null));
      }
      toast.success('Project deleted successfully');
    } catch (error) {
      toast.error(error || 'Failed to delete project');
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description,
      status: task.status,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    });
    setIsTaskModalOpen(true);
    setIsEditMode(true);
  };

  const handleDeleteTask = async (taskId) => {
    setTaskToDelete(taskId);
    setIsDeleteConfirmationOpen(true);
  };

  const confirmDeleteTask = async () => {
    try {
      await dispatch(deleteTask(taskToDelete)).unwrap();
      toast.success('Task deleted successfully');
    } catch (error) {
      toast.error(error || 'Failed to delete task');
    }
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    const errors = validateProjectForm(projectForm);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      if (isEditMode && editingProject) {
        await dispatch(updateProject({ id: editingProject._id, data: projectForm })).unwrap();
        toast.success('Project updated successfully');
      } else {
        await dispatch(createProject(projectForm)).unwrap();
        toast.success('Project created successfully');
      }
      setIsProjectModalOpen(false);
      setProjectForm({ name: '', description: '' });
      setFormErrors({});
      setIsEditMode(false);
      setEditingProject(null);
    } catch (error) {
      toast.error(error || `Failed to ${isEditMode ? 'update' : 'create'} project`);
    }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;

    const taskData = {
      ...taskForm,
      project: selectedProject._id,
      assignee: assignee || null,
    };

    // Remove dueDate if it's empty
    if (!taskData.dueDate) {
      delete taskData.dueDate;
    }

    const errors = validateTaskForm(taskData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      if (isEditMode && editingTask) {
        await dispatch(updateTask({ id: editingTask._id, data: taskData })).unwrap();
        toast.success('Task updated successfully');
      } else {
        await dispatch(createTask(taskData)).unwrap();
        toast.success('Task created successfully');
      }
      setIsTaskModalOpen(false);
      setTaskForm({
        title: '',
        description: '',
        status: TASK_STATUS.TODO,
        dueDate: '',
      });
      setAssignee('');
      setFormErrors({});
      setIsEditMode(false);
      setEditingTask(null);
    } catch (error) {
      toast.error(error || `Failed to ${isEditMode ? 'update' : 'create'} task`);
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      console.log('Starting task update:', { taskId, newStatus });
      const task = tasks.find(t => t._id === taskId);
      if (!task) {
        console.error('Task not found:', taskId);
        return;
      }
      
      await dispatch(updateTask({ 
        id: taskId, 
        data: { ...task, status: newStatus } 
      })).unwrap();
      
      toast.success('Task status updated');
    } catch (error) {
      console.error('Failed to update task status:', error);
      toast.error('Failed to update task status');
    }
  };

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    console.log('Drag ended:', { destination, source, draggableId });

    // If dropped outside a droppable area or in same position
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    // Update task status
    handleUpdateTaskStatus(draggableId, destination.droppableId);
  };

  const renderTaskCard = (task) => {
    const canEdit = isAdmin || task.assignee === user?._id;
    return (
      <TaskCard
        key={task._id}
        task={task}
        onStatusChange={handleUpdateTaskStatus}
        onEdit={canEdit ? handleEditTask : null}
        onDelete={canEdit ? handleDeleteTask : null}
      />
    );
  };

  // Remove frontend filtering and show all projects returned by the API
  const filteredProjects = projects;

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <h1 className="text-3xl font-bold text-gray-900">TaskFlow360</h1>
              <nav className="hidden md:flex space-x-4">
                <a 
                  href="#" 
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsAnalyticsOpen(false);
                    setIsHelpOpen(false);
                  }}
                >
                  Dashboard
                </a>
                {isAdmin && (
                  <a 
                    href="#" 
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsAnalyticsOpen(true);
                    }}
                  >
                    Analytics
                  </a>
                )}
                <a 
                  href="#" 
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsHelpOpen(true);
                  }}
                >
                  Help
                </a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setIsUserSettingsOpen(true)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline">{user?.name}</span>
                </button>
              </div>
              <button
                onClick={() => dispatch(logout())}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto py-6 px-4">
        {/* Projects and Tasks Container */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Projects List */}
          <div className="w-full md:w-1/3 lg:w-1/4 bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Projects</h2>
              {isAdmin && (
                <button
                  onClick={() => setIsProjectModalOpen(true)}
                  className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  + New
                </button>
              )}
            </div>
            <div className="space-y-2">
              {projectsLoading ? (
                <div className="text-center py-4">Loading projects...</div>
              ) : filteredProjects?.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  {isAdmin ? 'No projects yet' : 'No assigned projects'}
                </div>
              ) : (
                filteredProjects.map((project) => (
                  <div
                    key={project._id}
                    className={`p-3 rounded-lg cursor-pointer ${
                      selectedProject?._id === project._id
                        ? 'bg-blue-100 border-blue-500'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => dispatch(setSelectedProject(project))}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{project.name}</h3>
                        <p className="text-sm text-gray-600">{project.description}</p>
                      </div>
                      {isAdmin && (
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditProject(project);
                            }}
                            className="text-blue-500 hover:text-blue-700"
                            title="Edit Project"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProject(project._id);
                            }}
                            className="text-red-500 hover:text-red-700"
                            title="Delete Project"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Tasks Section */}
          <div className="w-full md:w-2/3 lg:w-3/4 bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                {selectedProject ? `Tasks - ${selectedProject.name}` : 'Select a project'}
              </h2>
              <div className="flex space-x-2">
                {selectedProject && isAdmin && (
                  <button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="px-3 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                  >
                    + Invite
                  </button>
                )}
                {selectedProject && isAdmin && (
                  <button
                    onClick={() => setIsTaskModalOpen(true)}
                    className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    + Add Task
                  </button>
                )}
              </div>
            </div>

            {selectedProject ? (
              tasksLoading ? (
                <div className="text-center py-4">Loading tasks...</div>
              ) : (
                <DragDropContext onDragEnd={onDragEnd}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Todo Column */}
                    <Droppable droppableId={TASK_STATUS.TODO}>
                      {(provided) => (
                        <div 
                          className="bg-gray-50 p-4 rounded-lg"
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                        >
                          <h3 className="font-medium mb-3">{TASK_STATUS_LABELS[TASK_STATUS.TODO]}</h3>
                          <div className="space-y-2">
                            {tasks
                              .filter((task) => 
                                task.status === TASK_STATUS.TODO && 
                                (isAdmin || task.assignee === user?._id)
                              )
                              .map(renderTaskCard)}
                            {provided.placeholder}
                          </div>
                        </div>
                      )}
                    </Droppable>

                    {/* In Progress Column */}
                    <Droppable droppableId={TASK_STATUS.IN_PROGRESS}>
                      {(provided) => (
                        <div 
                          className="bg-gray-50 p-4 rounded-lg"
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                        >
                          <h3 className="font-medium mb-3">{TASK_STATUS_LABELS[TASK_STATUS.IN_PROGRESS]}</h3>
                          <div className="space-y-2">
                            {tasks
                              .filter((task) => 
                                task.status === TASK_STATUS.IN_PROGRESS && 
                                (isAdmin || task.assignee === user?._id)
                              )
                              .map(renderTaskCard)}
                            {provided.placeholder}
                          </div>
                        </div>
                      )}
                    </Droppable>

                    {/* Done Column */}
                    <Droppable droppableId={TASK_STATUS.DONE}>
                      {(provided) => (
                        <div 
                          className="bg-gray-50 p-4 rounded-lg"
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                        >
                          <h3 className="font-medium mb-3">{TASK_STATUS_LABELS[TASK_STATUS.DONE]}</h3>
                          <div className="space-y-2">
                            {tasks
                              .filter((task) => 
                                task.status === TASK_STATUS.DONE && 
                                (isAdmin || task.assignee === user?._id)
                              )
                              .map(renderTaskCard)}
                            {provided.placeholder}
                          </div>
                        </div>
                      )}
                    </Droppable>
                  </div>
                </DragDropContext>
              )
            ) : (
              <div className="text-center text-gray-500">
                Select a project to view its tasks
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white shadow mt-8">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <p className="text-gray-500 text-sm">© 2024 TaskFlow360. All rights reserved.</p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-gray-700 text-sm">Privacy Policy</a>
              <a href="#" className="text-gray-500 hover:text-gray-700 text-sm">Terms of Service</a>
              <a href="#" className="text-gray-500 hover:text-gray-700 text-sm">Contact</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <UserSettings
        isOpen={isUserSettingsOpen}
        onClose={() => setIsUserSettingsOpen(false)}
      />

      {/* Project Modal */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setIsProjectModalOpen(false);
                  setIsEditMode(false);
                  setEditingProject(null);
                  setProjectForm({ name: '', description: '' });
                  setFormErrors({});
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <h2 className="text-xl font-semibold mb-4">
              {isEditMode ? 'Edit Project' : 'Create New Project'}
            </h2>
            <form onSubmit={handleProjectSubmit}>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Project Name"
                  className={`w-full px-4 py-2 border rounded-lg ${
                    formErrors.name ? 'border-red-500' : ''
                  }`}
                  value={projectForm.name}
                  onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                />
                {formErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                )}
              </div>
              <textarea
                placeholder="Description"
                className="w-full px-4 py-2 mb-4 border rounded-lg"
                value={projectForm.description}
                onChange={(e) =>
                  setProjectForm({ ...projectForm, description: e.target.value })
                }
              />
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
              >
                {isEditMode ? 'Update Project' : 'Create Project'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setIsTaskModalOpen(false);
                  setIsEditMode(false);
                  setEditingTask(null);
                  setTaskForm({
                    title: '',
                    description: '',
                    status: TASK_STATUS.TODO,
                    dueDate: '',
                  });
                  setAssignee('');
                  setFormErrors({});
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <h2 className="text-xl font-semibold mb-4">
              {isEditMode ? 'Edit Task' : 'Create New Task'}
            </h2>
            <form onSubmit={handleTaskSubmit}>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Task Title"
                  className={`w-full px-4 py-2 border rounded-lg ${
                    formErrors.title ? 'border-red-500' : ''
                  }`}
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                />
                {formErrors.title && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
                )}
              </div>
              <textarea
                placeholder="Description"
                className="w-full px-4 py-2 mb-4 border rounded-lg"
                value={taskForm.description}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, description: e.target.value })
                }
              />
              {isAdmin && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign To Project Member
                  </label>
                  <select
                    className="w-full px-4 py-2 border rounded-lg bg-white"
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    required
                  >
                    <option value="">Select Project Member</option>
                    {projectMembers
                      .filter(member => member?._id !== user?._id)
                      .map((member) => (
                        <option key={member._id} value={member?._id}>
                          {member.name} ({member.email})
                        </option>
                      ))}
                  </select>
                  {projectMembers.filter(member => member?._id !== user?._id).length === 0 && (
                    <p className="text-sm text-yellow-600 mt-1">
                      No other members in this project yet
                    </p>
                  )}
                </div>
              )}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border rounded-lg"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
              >
                {isEditMode ? 'Update Task' : 'Create Task'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={isDeleteConfirmationOpen && projectToDelete}
        onClose={() => {
          setIsDeleteConfirmationOpen(false);
          setProjectToDelete(null);
        }}
        onConfirm={confirmDeleteProject}
        title="Delete Project"
        message="Are you sure you want to delete this project? All associated tasks will be deleted."
      />

      <ConfirmationModal
        isOpen={isDeleteConfirmationOpen && taskToDelete}
        onClose={() => {
          setIsDeleteConfirmationOpen(false);
          setTaskToDelete(null);
        }}
        onConfirm={confirmDeleteTask}
        title="Delete Task"
        message="Are you sure you want to delete this task?"
      />

      <Analytics
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
      />
      
      <Help
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        projectId={selectedProject?._id}
      />
    </div>
  );
}
