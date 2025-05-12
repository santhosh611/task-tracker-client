import { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaSearch,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import { IoMdRefresh } from "react-icons/io";
import { useAuth } from '../../hooks/useAuth';
import { getPublicWorkers } from '../../services/workerService';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import appContext from '../../context/AppContext';

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
  const [manualSubdomain, setManualSubdomain] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();
  const { subdomain, setSubdomain } = useContext(appContext);

  const workersPerPage = 12;
  const totalWorkers = filteredWorkers.length;
  const totalPages = Math.ceil(totalWorkers / workersPerPage);

  // Handle subdomain submission
  const handleSubdomainSubmit = (e) => {
    e.preventDefault();
    if (!manualSubdomain) {
      toast.error('Please enter a subdomain.');
      return;
    }
    localStorage.setItem('tasktracker-subdomain', manualSubdomain);
    setSubdomain(manualSubdomain);
  };

  // Load workers
  const loadWorkers = useCallback(async () => {
    if (!subdomain || subdomain === 'main') return;

    try {
      setIsLoadingWorkers(true);
      const workersData = await getPublicWorkers({ subdomain });
      setWorkers(workersData || []);
    } catch (error) {
      console.error('Worker load error:', error);
      toast.error('Failed to load workers. Please try again later.');
    } finally {
      setIsLoadingWorkers(false);
    }
  }, [subdomain]);

  useEffect(() => {
    loadWorkers();
  }, [loadWorkers, subdomain]);

  // Filter workers
  useEffect(() => {
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
  }, [workers, searchTerm, department]);

  const paginatedWorkers = filteredWorkers.slice(
    (currentPage - 1) * workersPerPage,
    currentPage * workersPerPage
  );

  const departments = ['All', ...new Set(workers.map(w => w.department).filter(Boolean))];

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!selectedWorker || !password) {
      toast.error('Please select a worker and enter password');
      return;
    }

    if (!subdomain || subdomain === 'main') {
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

      toast.success(`Welcome, ${selectedWorker.name}!`);
      navigate('/worker');
    } catch (error) {
      toast.error(error.message || 'Login failed. Check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    if (currentPage > 1) {
      pageNumbers.push(
        <button key="prev" onClick={() => setCurrentPage(currentPage - 1)} className="px-3 py-1 bg-gray-200 rounded">
          <FaChevronLeft />
        </button>
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-4 py-1 ${currentPage === i ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'} rounded`}
        >
          {i}
        </button>
      );
    }

    if (currentPage < totalPages) {
      pageNumbers.push(
        <button key="next" onClick={() => setCurrentPage(currentPage + 1)} className="px-3 py-1 bg-gray-200 rounded">
          <FaChevronRight />
        </button>
      );
    }

    return <div className="flex justify-center items-center space-x-2 mt-6">{pageNumbers}</div>;
  };

  // Show subdomain form if subdomain is missing
  if (!subdomain || subdomain === 'main') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <form
          onSubmit={handleSubdomainSubmit}
          className="bg-white p-8 rounded shadow-md w-full max-w-md"
        >
          <h2 className="text-xl font-bold mb-4 text-center">Enter Your Subdomain</h2>
          <input
            type="text"
            placeholder="e.g. company123"
            value={manualSubdomain}
            onChange={(e) => setManualSubdomain(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded mb-4"
            required
          />
          <Button type="submit" variant="primary" fullWidth>
            Continue
          </Button>
        </form>
      </div>
    );
  }

  // Main Worker Login UI
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
              onClick={loadWorkers}
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
                  className={`cursor-pointer p-4 rounded-lg text-center transition-all hover:shadow-lg ${selectedWorker?._id === worker._id
                    ? 'bg-primary/10 border-2 border-primary'
                    : 'bg-white border border-gray-200'
                    }`}
                >
                  <div className="w-20 h-20 rounded-full mx-auto mb-2 bg-primary text-white flex items-center justify-center font-bold text-2xl overflow-hidden">
                    <img
                      src={
                        worker.photo
                          ? worker.photo
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.name)}`
                      }
                      alt="Worker"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>

                  <h3 className="font-medium truncate">{worker.name}</h3>
                  <p className="text-xs text-gray-500 truncate">{worker.department}</p>
                </div>
              ))}
            </div>

            {renderPagination()}
          </>
        )}

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
                <div className="form-group relative">
                  <label htmlFor="password" className="form-label flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    className="form-input group-hover:border-primary transition-all duration-300 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-0 top-0 mt-7 mr-3 focus:outline-none"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>

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
