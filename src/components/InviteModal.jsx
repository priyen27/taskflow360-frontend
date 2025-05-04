import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { inviteUserToProject, clearInviteStatus } from '../redux/projects/projectSlice';
import { toast } from 'react-toastify';

export default function InviteModal({ isOpen, onClose, projectId }) {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const { loading, error, inviteStatus } = useSelector((state) => state.projects);

  useEffect(() => {
    if (inviteStatus === 'success') {
      toast.success('User invited successfully');
      setEmail('');
      setRole('member');
      onClose();
      dispatch(clearInviteStatus());
    } else if (inviteStatus === 'failed' && error) {
      toast.error(error);
      dispatch(clearInviteStatus());
    }
  }, [inviteStatus, error, dispatch, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Email is required');
      return;
    }
    await dispatch(inviteUserToProject({ projectId, email, role }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Invite User to Project</h2>
          <button
            onClick={() => {
              onClose();
              setEmail('');
              setRole('member');
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-white"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-lg text-white ${
              loading
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {loading ? 'Inviting...' : 'Send Invite'}
          </button>
        </form>
      </div>
    </div>
  );
} 