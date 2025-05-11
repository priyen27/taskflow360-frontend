import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import UserSettings from '../UserSettings';
import Analytics from '../Analytics';
import Help from '../Help';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';

const Header = () => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isUserSettingsOpen, setIsUserSettingsOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isAnyModalOpen = isUserSettingsOpen || isHelpOpen || isAnalyticsOpen;
  useBodyScrollLock(isAnyModalOpen);

  return (
    <>
      <header className="sticky top-0 bg-white shadow z-50">
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
                    navigate('/');
                  }}
                >
                  Dashboard
                </a>
                {isAdmin && (
                  <>
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
                    <a
                      href="#"
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('/calendar');
                      }}
                    >
                      Calendar
                    </a>
                  </>
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

      {/* Modals */}
      <UserSettings
        isOpen={isUserSettingsOpen}
        onClose={() => setIsUserSettingsOpen(false)}
      />
      <Analytics
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
      />
      <Help
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </>
  );
};

export default Header;
