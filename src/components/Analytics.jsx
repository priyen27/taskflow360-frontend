import React from 'react';
import { useSelector } from 'react-redux';
import { TASK_STATUS } from '../constants/taskConstants';
import { useNavigate } from 'react-router-dom';

export default function Analytics({ isOpen, onClose }) {
  const { projects } = useSelector((state) => state.projects);
  const { tasks } = useSelector((state) => state.tasks);
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  // Redirect non-admin users
  React.useEffect(() => {
    if (isOpen && user?.role !== 'admin') {
      onClose();
      navigate('/dashboard');
    }
  }, [isOpen, user, navigate, onClose]);

  // Don't render anything for non-admin users
  if (!isOpen || user?.role !== 'admin') return null;

  const getTaskStats = () => {
    const total = tasks.length;
    const todo = tasks.filter(task => task.status === TASK_STATUS.TODO).length;
    const inProgress = tasks.filter(task => task.status === TASK_STATUS.IN_PROGRESS).length;
    const done = tasks.filter(task => task.status === TASK_STATUS.DONE).length;

    return { total, todo, inProgress, done };
  };

  const taskStats = getTaskStats();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Analytics Dashboard</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Project Statistics */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-4">Project Overview</h3>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-blue-600">{projects.length}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-green-600">
                  {projects?.filter(p => tasks?.some(t => t.project === p?._id && t.status !== TASK_STATUS.DONE)).length}
                </p>
              </div>
            </div>
          </div>

          {/* Task Statistics */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-4">Task Overview</h3>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-blue-600">{taskStats.total}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                  <p className="text-gray-600">Todo</p>
                  <p className="text-xl font-bold text-yellow-600">{taskStats.todo}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <p className="text-gray-600">In Progress</p>
                  <p className="text-xl font-bold text-orange-600">{taskStats.inProgress}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <p className="text-gray-600">Done</p>
                  <p className="text-xl font-bold text-green-600">{taskStats.done}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 