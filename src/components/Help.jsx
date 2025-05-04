import React, { useState } from 'react';

const faqs = [
  {
    question: 'How do I create a new project?',
    answer: 'Click the "+ New" button in the Projects section. Enter a name and optional description for your project, then click "Create Project".'
  },
  {
    question: 'How do I add tasks to a project?',
    answer: 'First select a project from the projects list, then click the "+ Add Task" button. Fill in the task details and click "Create Task".'
  },
  {
    question: 'How do I change a task\'s status?',
    answer: 'Click on the task card and use the status dropdown menu to change its status between Todo, In Progress, and Done.'
  },
  {
    question: 'How do I update my password?',
    answer: 'Click on your profile icon in the top right corner, then click "User Settings". In the settings modal, you can update your password.'
  },
  {
    question: 'Can I delete a project?',
    answer: 'Yes, you can delete a project by clicking the "×" button on the project card. Note that this will also delete all tasks associated with the project.'
  }
];

export default function Help({ isOpen, onClose }) {
  const [selectedFaq, setSelectedFaq] = useState(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Help Center</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quick Start Guide */}
          <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-4">Quick Start Guide</h3>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <h4 className="font-medium text-blue-600 mb-2">1. Create a Project</h4>
                <p className="text-gray-600">Start by creating a new project to organize your tasks. Give it a clear name and description.</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h4 className="font-medium text-blue-600 mb-2">2. Add Tasks</h4>
                <p className="text-gray-600">Break down your project into manageable tasks. Add due dates and descriptions to keep track of requirements.</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h4 className="font-medium text-blue-600 mb-2">3. Track Progress</h4>
                <p className="text-gray-600">Update task statuses as you work. Use the Analytics dashboard to monitor overall progress.</p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-4">Frequently Asked Questions</h3>
            <div className="space-y-2">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-lg shadow">
                  <button
                    className="w-full px-4 py-2 text-left font-medium hover:bg-gray-50 focus:outline-none"
                    onClick={() => setSelectedFaq(selectedFaq === index ? null : index)}
                  >
                    <div className="flex justify-between items-center">
                      <span>{faq.question}</span>
                      <span className="text-gray-500">
                        {selectedFaq === index ? '−' : '+'}
                      </span>
                    </div>
                  </button>
                  {selectedFaq === index && (
                    <div className="px-4 py-2 text-gray-600 border-t">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-6 bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Need More Help?</h3>
          <p className="text-gray-600">
            Contact our support team at{' '}
            <a href="mailto:support@taskflow360.com" className="text-blue-600 hover:text-blue-800">
              support@taskflow360.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 