import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAndInitAdmin } from '../services/authService';

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAdmin = async () => {
      try {
        await checkAndInitAdmin();
      } catch (error) {
        console.error('Admin initialization error:', error);
      }
    };

    initializeAdmin();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900">Task Tracker</h1>
        <p className="text-xl text-gray-600">Boost Productivity and Manage Tasks Efficiently</p>
        
        <div className="grid md:grid-cols-3 gap-6 mt-10">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              Track Progress
            </h2>
            <p className="text-gray-600 text-center">
              Monitor worker performance and productivity with real-time tracking.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Complete Tasks
            </h2>
            <p className="text-gray-600 text-center">
              Organize and complete tasks efficiently with our streamlined system.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Manage Time
            </h2>
            <p className="text-gray-600 text-center">
              Optimize time management and improve overall productivity.
            </p>
          </div>
        </div>
        
        <div className="flex justify-center space-x-4 mt-10">
          <button 
            onClick={() => navigate('/admin/login')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 transform hover:scale-105"
          >
            Admin Login
          </button>
          
          <button 
            onClick={() => navigate('/worker/login')}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 transform hover:scale-105"
          >
            Worker Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;