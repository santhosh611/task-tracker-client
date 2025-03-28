import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const CustomTaskForm = () => {
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [customTasks, setCustomTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [activeView, setActiveView] = useState('recent'); // 'recent', 'pending', 'approved', 'rejected'

  // Fetch worker's custom tasks
  useEffect(() => {
    const fetchCustomTasks = async () => {
      try {
        const response = await api.get('/tasks/custom/me');
        setCustomTasks(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching custom tasks:', error);
        toast.error('Failed to load custom tasks');
        setLoading(false);
      }
    };

    fetchCustomTasks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!description.trim()) {
      toast.error('Please provide a task description');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await api.post('/tasks/custom', { description });
      setCustomTasks([response.data, ...customTasks]);
      setDescription('');
      toast.success('Custom task submitted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit custom task');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Pending</span>;
      case 'approved':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Rejected</span>;
      default:
        return null;
    }
  };

  const filterTasks = () => {
    if (activeView === 'recent') {
      return customTasks.slice(0, showAllTasks ? customTasks.length : 3);
    } else if (activeView === 'pending') {
      const filtered = customTasks.filter(task => task.status === 'pending');
      return showAllTasks ? filtered : filtered.slice(0, 3);
    } else if (activeView === 'approved') {
      const filtered = customTasks.filter(task => task.status === 'approved');
      return showAllTasks ? filtered : filtered.slice(0, 3);
    } else if (activeView === 'rejected') {
      const filtered = customTasks.filter(task => task.status === 'rejected');
      return showAllTasks ? filtered : filtered.slice(0, 3);
    }
    return [];
  };

  const getTabClassName = (tabName) => {
    return `px-3 py-1 rounded-md cursor-pointer ${
      activeView === tabName
        ? 'bg-blue-600 text-white'
        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
    }`;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <h2 className="text-lg font-semibold mb-4">Submit Custom Task</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Task Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded-md"
            rows="3"
            placeholder="Describe the task you've completed..."
            disabled={submitting}
          ></textarea>
        </div>
        
        <button
          type="submit"
          className={`px-4 py-2 rounded-md text-white ${
            submitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Submit Task'}
        </button>
      </form>
      
      {/* Custom tasks section */}
      {customTasks.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-medium">Your Custom Tasks</h3>
            <button 
              onClick={() => setShowAllTasks(!showAllTasks)}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
            >
              {showAllTasks ? (
                <>Show Less {<FaChevronUp className="ml-1" />}</>
              ) : (
                <>Show All {<FaChevronDown className="ml-1" />}</>
              )}
            </button>
          </div>
          
          {/* View tabs */}
          <div className="flex space-x-2 mb-4">
            <div 
              className={getTabClassName('recent')}
              onClick={() => setActiveView('recent')}
            >
              Recent
            </div>
            <div 
              className={getTabClassName('pending')}
              onClick={() => setActiveView('pending')}
            >
              Pending
            </div>
            <div 
              className={getTabClassName('approved')}
              onClick={() => setActiveView('approved')}
            >
              Approved
            </div>
            <div 
              className={getTabClassName('rejected')}
              onClick={() => setActiveView('rejected')}
            >
              Rejected
            </div>
          </div>
          
          <div className="space-y-2">
            {filterTasks().map(task => (
              <div key={task._id} className="p-3 border rounded-md">
                <div className="flex justify-between">
                  <span className="text-gray-700">{task.description}</span>
                  <div className="flex items-center">
                    {getStatusBadge(task.status)}
                    {task.status === 'approved' && (
                      <span className="ml-2 font-medium text-green-600">
                        +{task.points} pts
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(task.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
          
          {/* Show "View All" button if there are more tasks than shown */}
          {!showAllTasks && customTasks.length > 3 && (
            <button
              onClick={() => setShowAllTasks(true)}
              className="mt-4 w-full py-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md"
            >
              View All ({customTasks.length}) Tasks
            </button>
          )}
        </div>
      )}
      
      {loading && <p className="text-center mt-4">Loading...</p>}
      
      {!loading && customTasks.length === 0 && (
        <p className="text-center mt-4 text-gray-500">
          You haven't submitted any custom tasks yet.
        </p>
      )}
    </div>
  );
};

export default CustomTaskForm;