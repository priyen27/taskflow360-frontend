import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { useSelector, useDispatch } from 'react-redux';
import { getTasksByProject } from '../redux/tasks/taskSlice';
import { getProjects, setSelectedProject } from '../redux/projects/projectSlice';
import Layout from '../components/layout/Layout';

const CalendarView = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { projects, selectedProject } = useSelector((state) => state.projects);
  const { tasks } = useSelector((state) => state.tasks);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (user?.user?.role === 'admin') {
      dispatch(getProjects());
    }
  }, [dispatch, user?.user?.role]);

  useEffect(() => {
    if (selectedProject?._id) {
      dispatch(getTasksByProject(selectedProject._id));
    }
  }, [selectedProject, dispatch]);

  useEffect(() => {
    const calendarEvents = tasks
    .filter((task) => !!task.dueDate)
    .map((task) => {
      let color = '#6b7280'; // Default: gray for 'todo'
      if (task.status === 'done') color = '#22c55e';
      else if (task.status === 'in progress') color = '#3b82f6';
  
      return {
        title: task.title,
        date: task.dueDate,
        backgroundColor: color,
        borderColor: 'transparent',
        textColor: 'white',
        extendedProps: { task },
      };
    });  

    setEvents(calendarEvents);
  }, [tasks]);

  const handleProjectChange = (e) => {
    const selected = projects.find((p) => p._id === e.target.value);
    if (selected) {
      dispatch(setSelectedProject(selected));
    }
  };

  const renderEventContent = (eventInfo) => {
    const task = eventInfo.event.extendedProps.task;
    const bgColor = eventInfo.event.backgroundColor;
  
    return (
      <div className="relative group">
        {/* Event Pill */}
        <div
          className="p-2 rounded-md text-white text-sm font-medium truncate shadow 
                     transition-all duration-200 ease-in-out 
                     hover:scale-[1.03]"
          style={{ backgroundColor: bgColor }}
        >
          {eventInfo.event.title}
        </div>
  
        {/* Custom Tooltip */}
        <div
          className="absolute z-50 left-0 top-full mt-1 w-64 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-xl 
                     opacity-0 group-hover:opacity-100 
                     transition-opacity duration-300 pointer-events-none"
        >
          <p className="font-semibold text-sm mb-1">{eventInfo.event.title}</p>
          <p className="mb-1">
            <span className="font-medium text-gray-300">Due:</span>{' '}
            {new Date(task.dueDate).toLocaleDateString()}
          </p>
          <p className="text-gray-300 whitespace-pre-wrap">
            {task.description || 'No description provided'}
          </p>
        </div>
      </div>
    );
  };  

  return (
    <Layout>
        <div className="p-6 bg-white rounded-xl shadow mt-6 max-w-6xl mx-auto">
        <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-2xl font-semibold text-gray-800">📅 Calendar View</h2>

            <div className="flex flex-col md:flex-row gap-2 items-start md:items-center">
            <label htmlFor="project" className="text-sm font-medium text-gray-700">
                Select Project:
            </label>
            <select
                id="project"
                className="px-4 py-2 border rounded-lg bg-white text-sm"
                value={selectedProject?._id || ''}
                onChange={handleProjectChange}
            >
                <option value="" disabled>Select a project</option>
                {projects.map((project) => (
                <option key={project._id} value={project._id}>
                    {project.name}
                </option>
                ))}
            </select>
            </div>
        </div>
        <div className="flex items-center gap-4 text-sm mb-2">
            <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-[#6b7280] rounded"></div> Todo
            </div>
            <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-[#3b82f6] rounded"></div> In Progress
            </div>
            <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-[#22c55e] rounded"></div> Done
            </div>
        </div>


        {!selectedProject ? (
            <div className="text-center text-gray-500 mt-10 text-lg">
            Please select a project to view its tasks
            </div>
        ) : (
            <FullCalendar
                plugins={[dayGridPlugin]}
                initialView="dayGridMonth"
                height="auto"
                events={events}
                eventContent={renderEventContent}
                extendedProps
            />
        )}
        </div>
    </Layout>
  );
};

export default CalendarView;
