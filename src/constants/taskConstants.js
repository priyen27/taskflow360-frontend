export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in progress',
  DONE: 'done',
};

export const TASK_STATUS_LABELS = {
  [TASK_STATUS.TODO]: 'To Do',
  [TASK_STATUS.IN_PROGRESS]: 'In Progress',
  [TASK_STATUS.DONE]: 'Done',
};

export const PROJECT_VALIDATION = {
  name: {
    required: true,
    minLength: 1,
    message: 'Project name is required',
  },
};

export const TASK_VALIDATION = {
  title: {
    required: true,
    minLength: 1,
    message: 'Task title is required',
  },
  project: {
    required: true,
    message: 'Project is required',
  },
}; 