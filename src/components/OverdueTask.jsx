import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOverdueTasks } from '../redux/tasks/taskSlice';
import { motion } from 'framer-motion';

const OverdueTasks = () => {
  const dispatch = useDispatch();
  const { overdueTasks, overdueLoading, overdueError } = useSelector((state) => state.tasks);

  useEffect(() => {
    dispatch(fetchOverdueTasks());
  }, [dispatch]);

  return (
    <motion.div
      className="bg-white p-6 rounded-xl shadow-md mt-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2 className="text-lg font-semibold mb-4">⚠️ Overdue Tasks</h2>
      {overdueLoading ? (
        <p>Loading...</p>
      ) : overdueError ? (
        <p className="text-red-500">{overdueError}</p>
      ) : overdueTasks.length === 0 ? (
        <p className="text-gray-500">No overdue tasks 🎉</p>
      ) : (
        <ul className="space-y-2">
          {overdueTasks.map((task) => (
            <li key={task._id} className="border p-3 rounded-lg shadow-sm">
              <div className="text-md font-medium">{task.title}</div>
              <div className="text-sm text-gray-600">
                Project: <strong>{task.projectName}</strong> | Due:{' '}
                {new Date(task.dueDate).toLocaleDateString()}
              </div>
              <div className="text-sm text-red-600 font-medium">
                {task.status.toUpperCase()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
};

export default OverdueTasks;
