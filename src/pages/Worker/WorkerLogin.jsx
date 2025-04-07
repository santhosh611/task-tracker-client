import { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaSearch,
  FaFilter,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { getPublicWorkers } from '../../services/workerService';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import appContext from '../../context/AppContext';
import { IoMdRefresh } from "react-icons/io";

const WorkerLogin = () => {
  const [workers, setWorkers] = useState([]);
  const [filteredWorkers, setFilteredWorkers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingWorkers, setIsLoadingWorkers] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [department, setDepartment] = useState('All');

  const navigate = useNavigate();
  const { login } = useAuth();
  
  // Intelligent Pagination
  const workersPerPage = 12;
  const totalWorkers = filteredWorkers.length;
  const totalPages = Math.ceil(totalWorkers / workersPerPage);
  
  // Subdomain
  const { subdomain } = useContext(appContext);

  // Fetch workers with advanced pagination
  const loadWorkers = useCallback(async () => {
    try {
      if (!subdomain || subdomain == 'main') {
        return;
      }

      setIsLoadingWorkers(true);
      const workersData = await getPublicWorkers({ subdomain });
      setWorkers(workersData || []);
    } catch (error) {
      console.error('Worker load error:', error);
      toast.error('Failed to load workers. Please try again later.');
    } finally {
      setIsLoadingWorkers(false);
    }
  }, []);

  useEffect(() => {
    loadWorkers();
  }, [loadWorkers]);

  // Advanced Filtering
  useEffect(() => {
    const filterWorkers = () => {
      const filtered = workers.filter(worker => {
        const matchesSearch = !searchTerm ||
          worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (worker.department && worker.department.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesDepartment = department === 'All' ||
          worker.department === department;

        return matchesSearch && matchesDepartment;
      });

      setFilteredWorkers(filtered);
      setCurrentPage(1);
    };

    filterWorkers();
  }, [workers, searchTerm, department]);

  // Paginated Workers
  const paginatedWorkers = filteredWorkers.slice(
    (currentPage - 1) * workersPerPage,
    currentPage * workersPerPage
  );

  // Departments List
  const departments = ['All', ...new Set(workers.map(w => w.department).filter(Boolean))];

  // Login Handler
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!selectedWorker || !password) {
      toast.error('Please select a worker and enter password');
      return;
    }

    if (!subdomain || subdomain == 'main') {
      toast.error('Subdomain is missing, please check the URL');
      return;
    }

    setIsLoading(true);

    try {
      const response = await login({
        username: selectedWorker.username,
        password,
        subdomain
      }, 'worker');

      response.data && console.log(response.data);

      toast.success(`Welcome, ${selectedWorker.name}!`);
      navigate('/worker');
    } catch (error) {
      toast.error(error.message || 'Login failed. Check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Pagination Logic
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    // Previous button
    if (currentPage > 1) {
      pageNumbers.push(
        <button
          key="prev"
          onClick={() => setCurrentPage(currentPage - 1)}
          className="px-3 py-1 bg-gray-200 rounded"
        >
          <FaChevronLeft />
        </button>
      );
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`
            px-4 py-1 
            ${currentPage === i
              ? 'bg-primary text-white'
              : 'bg-gray-200 text-gray-700'}
            rounded
          `}
        >
          {i}
        </button>
      );
    }

    // Next button
    if (currentPage < totalPages) {
      pageNumbers.push(
        <button
          key="next"
          onClick={() => setCurrentPage(currentPage + 1)}
          className="px-3 py-1 bg-gray-200 rounded"
        >
          <FaChevronRight />
        </button>
      );
    }

    return (
      <div className="flex justify-center items-center space-x-2 mt-6">
        {pageNumbers}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Worker Login</h1>

          <div className="flex space-x-4">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search workers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        {isLoadingWorkers ? (
          <div className="flex justify-center items-center h-96">
            <Spinner size="lg" />
          </div>
        ) : filteredWorkers.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            No workers found. Try adjusting your search or filter.
            <button
              className='block mx-auto bg-white border border-gray-300 p-2 my-2 rounded-md'
              onClick={async () => {
                try {
                  if (!subdomain || subdomain == 'main') {
                    toast.error('Subdomain is missing, check the URL.');
                    return;
                  }
                  setIsLoadingWorkers(true);
                  const workersData = await getPublicWorkers({ subdomain });
                  setWorkers(workersData || []);
                } catch (error) {
                  console.error('Worker load error:', error);
                  toast.error('Failed to load workers. Please try again later.');
                } finally {
                  setIsLoadingWorkers(false);
                }
              }}
            >
              <IoMdRefresh />
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {paginatedWorkers.map((worker) => (
                <div
                  key={worker._id}
                  onClick={() => setSelectedWorker(worker)}
                  className={`
                    cursor-pointer 
                    p-4 
                    rounded-lg 
                    text-center 
                    transition-all 
                    hover:shadow-lg 
                    ${selectedWorker?._id === worker._id
                      ? 'bg-primary/10 border-2 border-primary'
                      : 'bg-white border border-gray-200'}
                  `}
                >
                  <div className="w-20 h-20 rounded-full mx-auto mb-2 bg-primary text-white flex items-center justify-center font-bold text-2xl">
                    {worker.name.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="font-medium truncate">{worker.name}</h3>
                  <p className="text-xs text-gray-500 truncate">{worker.department}</p>
                </div>
              ))}
            </div>

            {renderPagination()}
          </>
        )}

        {/* Login Modal */}
        {selectedWorker && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center font-bold text-3xl mr-4">
                  {selectedWorker.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{selectedWorker.name}</h2>
                  <p className="text-gray-500">{selectedWorker.department}</p>
                </div>
                <button
                  onClick={() => setSelectedWorker(null)}
                  className="ml-auto text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleLogin}>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4"
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={isLoading}
                >
                  {isLoading ? <Spinner size="sm" /> : 'Login'}
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerLogin;