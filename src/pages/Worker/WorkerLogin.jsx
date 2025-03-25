import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaSearch } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { getWorkers } from '../../services/workerService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import { getPublicWorkers } from '../../services/workerService';

const WorkerLogin = () => {
  const [workers, setWorkers] = useState([]);
  const [filteredWorkers, setFilteredWorkers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [password, setPassword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingWorkers, setIsLoadingWorkers] = useState(true);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  
  // Load workers on component mount
  useEffect(() => {
    const loadWorkers = async () => {
      try {
        const workersData = await getPublicWorkers();
        setWorkers(workersData);
        setFilteredWorkers(workersData);
      } catch (error) {
        toast.error('Failed to load workers');
        setWorkers([]);
        setFilteredWorkers([]);
      } finally {
        setIsLoadingWorkers(false);
      }
    };
    
    loadWorkers();
  }, []);
  
  // Filter workers based on search term
  useEffect(() => {
    // Ensure workers is an array before filtering
    if (!Array.isArray(workers)) {
      setFilteredWorkers([]);
      return;
    }

    if (searchTerm.trim() === '') {
      setFilteredWorkers(workers);
    } else {
      const filtered = workers.filter(
        worker =>
          worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (worker.department && worker.department.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredWorkers(filtered);
    }
  }, [searchTerm, workers]);
  
  const openLoginModal = (worker) => {
    setSelectedWorker(worker);
    setPassword('');
    setIsModalOpen(true);
  };
  
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!password) {
      toast.error('Please enter your password');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await login({ username: selectedWorker.username, password }, 'worker');
      navigate('/worker');
    } catch (error) {
      toast.error(error.message || 'Login failed. Please check your password.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Worker Login</h1>
        
        <div className="max-w-xl mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              className="form-input pl-10"
              placeholder="Search workers by name or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        
        {isLoadingWorkers ? (
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Loading workers...</p>
          </div>
        ) : filteredWorkers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-lg text-gray-600">No workers found. Try a different search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.isArray(filteredWorkers) && filteredWorkers.map((worker) => (
              <div
                key={worker._id || worker.id || Math.random().toString(36).substr(2, 9)}
                className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => openLoginModal(worker)}
              >
                <img
                  src={worker.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.name)}&size=128`}
                  alt={worker.name}
                  className="w-24 h-24 rounded-full mx-auto mb-3 object-cover"
                />
                <h3 className="text-center font-medium">{worker.name}</h3>
                <p className="text-center text-sm text-gray-500">{worker.department || 'No Department'}</p>
              </div>
            ))}
          </div>
        )}
        
        {/* Modal remains the same */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Login: ${selectedWorker?.name || ''}`}
        >
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                id="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isLoading}
                required
              />
            </div>
            
            <div className="flex justify-end mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="mr-2"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
              >
                {isLoading ? <Spinner size="sm" /> : 'Login'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default WorkerLogin;