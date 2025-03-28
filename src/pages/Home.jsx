import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChartLine, FaTasks, FaClock } from 'react-icons/fa';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating Shapes */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-float"></div>

      <div className="relative z-10 max-w-5xl w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-12">
        <h1 className="text-5xl font-bold text-center text-white mb-6">Task Tracker</h1>
        <p className="text-xl text-center text-white/80 mb-12">
          Empowering Productivity Through Smart Management
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: FaChartLine, title: 'Track Progress', desc: 'Real-time performance monitoring' },
            { icon: FaTasks, title: 'Manage Tasks', desc: 'Efficient task organization' },
            { icon: FaClock, title: 'Optimize Time', desc: 'Maximize workplace efficiency' }
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center">
              <Icon className="mx-auto text-4xl text-white/80 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
              <p className="text-white/60">{desc}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center space-x-6">
          <button 
            onClick={() => navigate('/admin/login')}
            className="bg-blue-500 text-white px-8 py-3 rounded-full hover:bg-blue-600 transition transform hover:scale-105"
          >
            Admin Login
          </button>
          <button 
            onClick={() => navigate('/worker/login')}
            className="bg-purple-500 text-white px-8 py-3 rounded-full hover:bg-purple-600 transition transform hover:scale-105"
          >
            Worker Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;