import React from 'react';
import { useSelector } from 'react-redux';
import { TASK_STATUS, TASK_STATUS_LABELS } from '../constants/taskConstants';

export default function TaskCard({ task, onStatusChange, onEdit, onDelete }) {
  const user = useSelector((state) => state.auth.user);
  const projectMembers = useSelector((state) => state.projects.projectMembers);
  const isAdmin = user?.role === 'admin';
  const isAssignee = task.assignee === user?._id;
  const canEdit = isAdmin || isAssignee;

  // Get assignee name - first check if current user is assignee
  let assigneeName = 'Unknown Member';
  if (isAssignee) {
    // If current user is assignee, use their name
    assigneeName = user.name;
  } else {
    // Otherwise look in project members
    const assignee = projectMembers?.find(member => member?._id === task.assignee);
    if (assignee) {
      assigneeName = assignee.name;
    }
  }

  const statusOptions = Object.entries(TASK_STATUS).map(([key, value]) => ({
    value,
    label: TASK_STATUS_LABELS[value]
  }));

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-2 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900">{task.title}</h3>
        {canEdit && (
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(task)}
              className="text-blue-500 hover:text-blue-700 transition-colors"
              title="Edit Task"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(task?._id)}
              className="text-red-500 hover:text-red-700 transition-colors"
              title="Delete Task"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
      
      <p className="text-gray-600 text-sm mb-2 line-clamp-2 h-10">
        {task.description}
      </p>
      
      <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
          {new Date(task.dueDate).toLocaleDateString()}
        </div>
      </div>

      {/* Show assignee info */}
      {task.assignee && (
        <div className="flex items-center mb-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs mr-2">
            {assigneeName.charAt(0).toUpperCase()}
          </div>
          <p className="text-sm text-gray-500">
            {assigneeName}
          </p>
        </div>
      )}

      {canEdit ? (
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task?._id, e.target.value)}
          className="w-full mt-2 px-2 py-1 border rounded text-sm bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <div className="mt-2 px-2 py-1 bg-gray-100 rounded text-sm">
          Status: {TASK_STATUS_LABELS[task.status]}
        </div>
      )}
    </div>
  );
} 