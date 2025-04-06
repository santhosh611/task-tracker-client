import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import { FiLogOut } from "react-icons/fi";

const Sidebar = ({
  links,
  logoText = 'Task Tracker',
  user,
  onLogout
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        className="md:hidden fixed top-4 left-4 z-20 p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
        onClick={toggleSidebar}
      >
        <span className="sr-only">Open sidebar</span>
        <FaBars className="h-6 w-6" />
      </button>

      {/* Sidebar Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 transition-transform duration-300 ease-in-out transform overflow-y-scroll ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
      >
        {/* Logo and close button */}
        <div className="flex items-center justify-between h-16 px-4 bg-gray-900">
          <div className="flex items-center">
            <span className="text-xl font-semibold text-white">{logoText}</span>
          </div>
          <button
            type="button"
            className="md:hidden p-2 rounded-md text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            onClick={toggleSidebar}
          >
            <span className="sr-only">Close sidebar</span>
            <FaTimes className="h-6 w-6" />
          </button>
        </div>

        {/* User profile */}
        {user && (
          <div className="px-4 py-5 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className='flex items-center'>
                <div className="flex-shrink-0">
                  <img
                    className="h-10 w-10 rounded-full object-cover"
                    src={user.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.username)}`}
                    alt={user.name || user.username}
                  />
                </div>
                <div className="ml-3">
                  <p className="text-base font-medium text-white">{user.name || user.username}</p>
                  <p className="text-sm font-medium text-gray-400">{user.department || user.role}</p>
                </div>
              </div>
              <div className="ml-3">
                {onLogout && <button 
                  className="font-medium text-white m-2 p-2 text-xl"
                  onClick={onLogout}
                >
                  <FiLogOut />
                </button>}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="mt-5 px-2 space-y-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${location.pathname === link.to
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              onClick={closeSidebar}
            >
              {link.icon && (
                <span className="mr-3 h-6 w-6 flex items-center justify-center">
                  {link.icon}
                </span>
              )}
              {link.label}
              {link.badge && (
                <span className="ml-auto px-2 py-0.5 text-xs font-medium rounded-full bg-red-500 text-white">
                  {link.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Logout button */}
        {/* {onLogout && (
          <div className="absolute bottom-0 w-full px-2 py-4 border-t border-gray-700">
            <button
              type="button"
              className="group flex items-center px-2 py-2 w-full text-base font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <span className="mr-3 h-6 w-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </span>
              Logout
            </button>
          </div>
        )} */}
      </div>
    </>
  );
};

export default Sidebar;