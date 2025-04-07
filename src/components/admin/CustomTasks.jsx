import { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { FaChevronDown, FaChevronUp, FaSearch, FaFilter } from 'react-icons/fa';
import api from '../../services/api';
import appContext from '../../context/AppContext';
import { getCustomTask } from '../../services/taskService';
import { getDepartments } from '../../services/departmentService';
import { getWorkers } from '../../services/workerService';
import Spinner from '../common/Spinner';

const CustomTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [activeView, setActiveView] = useState('pending');

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [departments, setDepartments] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedWorker, setSelectedWorker] = useState('');

  const { subdomain } = useContext(appContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          tasksResponse,
          departmentsResponse,
          workersResponse
        ] = await Promise.all([
          getCustomTask({ subdomain }),
          getDepartments({ subdomain }),
          getWorkers({ subdomain })
        ]);

        setTasks(tasksResponse);
        setFilteredTasks(tasksResponse);
        setDepartments(departmentsResponse);
        setWorkers(workersResponse);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters whenever filter criteria change
  useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedDepartment, selectedWorker, activeView, tasks]);

  const applyFilters = () => {
    let result = [...tasks];

    // Filter by status
    if (activeView !== 'all') {
      result = result.filter(task => task.status === activeView);
    }

    // Filter by department - more robust handling
    if (selectedDepartment) {
      result = result.filter(task => {
        // Debug logging to see the structure
        console.log('Task worker:', task.worker);
        console.log('Department check:',
          task.worker?.department,
          typeof task.worker?.department === 'object' ? task.worker?.department?._id : task.worker?.department
        );

        // Check department in multiple ways
        return task.worker && (
          // Department as object with _id
          (task.worker.department &&
            typeof task.worker.department === 'object' &&
            task.worker.department._id === selectedDepartment) ||
          // Department as direct ID reference
          (task.worker.department &&
            typeof task.worker.department === 'string' &&
            task.worker.department === selectedDepartment)
        );
      });
    }

    // Filter by worker
    if (selectedWorker) {
      result = result.filter(task =>
        task.worker && task.worker._id === selectedWorker
      );
    }

    // Search by description
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(task =>
        task.description.toLowerCase().includes(term) ||
        (task.worker && task.worker.name.toLowerCase().includes(term))
      );
    }

    setFilteredTasks(result);
  };

  const handleReview = async (taskId, status, points = 0) => {
    setProcessing(prev => ({ ...prev, [taskId]: true }));

    try {
      const response = await api.put(`/tasks/custom/${taskId}`, {
        status,
        points: status === 'approved' ? points : 0
      });

      // Update the tasks list with the reviewed task
      setTasks(tasks.map(task =>
        task._id === taskId ? response.data : task
      ));

      toast.success(`Task ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${status} task`);
    } finally {
      setProcessing(prev => ({ ...prev, [taskId]: false }));
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDepartment('');
    setSelectedWorker('');
    setActiveView('pending');
  };

  const PendingTaskItem = ({ task }) => {
    const [points, setPoints] = useState('');

    const handlePointsChange = (e) => {
      const value = e.target.value;
      if (value === '' || !isNaN(value)) {
        setPoints(value);
      }
    };

    return (
      <div className="border rounded-md p-4 mb-4 bg-white">
        <div className="flex justify-between">
          <div>
            <p className="font-medium">{task.worker?.name || 'Unknown Worker'}</p>
            <p className="text-sm text-gray-500">
              {task.worker?.department?.name && `${task.worker.department.name} • `}
              {new Date(task.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <p className="mt-2">{task.description}</p>

        {task.status === 'pending' && (
          <div className="mt-4 flex items-center">
            <div className="mr-4">
              <label className="block text-sm font-medium mb-1">Points</label>
              <input
                type="number"
                value={points}
                onChange={handlePointsChange}
                placeholder="Enter points"
                className="w-24 p-1 border rounded"
              />
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => {
                  const pointsToAward = points === '' ? 0 : parseInt(points);
                  handleReview(task._id, 'approved', pointsToAward);
                }}
                disabled={processing[task._id]}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Approve
              </button>

              <button
                onClick={() => handleReview(task._id, 'rejected')}
                disabled={processing[task._id]}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        )}

        {task.status !== 'pending' && (
          <div className="mt-2">
            <span className={`px-2 py-1 rounded-full text-xs ${task.status === 'approved'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
              }`}>
              {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
            </span>

            {task.status === 'approved' && (
              <span className="ml-2 font-medium text-green-600">
                {task.points} points awarded
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  const displayTasks = showAllTasks ? filteredTasks : filteredTasks.slice(0, 5);

  const getTabClassName = (tabName) => {
    return `px-3 py-1 rounded-md cursor-pointer ${activeView === tabName
      ? 'bg-blue-600 text-white'
      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Custom Tasks</h1>

      {loading ? (
        <Spinner size="md" variant="default" />
      ) : tasks.length === 0 ? (
        <p>No custom tasks submitted yet.</p>
      ) : (
        <div>
          {/* Search and Filters */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by description or worker name"
                    className="pl-10 pr-4 py-2 w-full border rounded-md"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Department Filter */}
              <div className="md:w-1/4">
                <select
                  className="w-full p-2 border rounded-md"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Worker Filter */}
              <div className="md:w-1/4">
                <select
                  className="w-full p-2 border rounded-md"
                  value={selectedWorker}
                  onChange={(e) => setSelectedWorker(e.target.value)}
                >
                  <option value="">All Workers</option>
                  {workers.map(worker => (
                    <option key={worker._id} value={worker._id}>
                      {worker.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters Button */}
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Clear Filters
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Task List</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                Showing {displayTasks.length} of {filteredTasks.length} tasks
              </span>
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
          </div>

          {/* View tabs */}
          <div className="flex space-x-2 mb-4 overflow-x-auto">
            <div
              className={getTabClassName('all')}
              onClick={() => setActiveView('all')}
            >
              All Tasks
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

          {displayTasks.length === 0 ? (
            <div className="bg-white p-4 rounded-lg text-center">
              <p>No {activeView !== 'all' ? activeView : ''} tasks found with the current filters.</p>
            </div>
          ) : (
            <>
              {displayTasks.map(task => <PendingTaskItem key={task._id} task={task} />)}

              {/* Show "View All" button if there are more tasks than shown */}
              {!showAllTasks && filteredTasks.length > 5 && (
                <button
                  onClick={() => setShowAllTasks(true)}
                  className="mt-4 w-full py-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md"
                >
                  View All ({filteredTasks.length}) Tasks
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomTasks;