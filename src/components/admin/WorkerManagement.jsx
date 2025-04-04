import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { getWorkers, createWorker, updateWorker, deleteWorker } from '../../services/workerService';
import { getDepartments } from '../../services/departmentService';
import Card from '../common/Card';
import Button from '../common/Button';
import Table from '../common/Table';
import Modal from '../common/Modal';
import Spinner from '../common/Spinner';
import appContext from '../../context/AppContext';

const WorkerManagement = () => {
  const [workers, setWorkers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true); 
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({ ...prev, photo: file }));
  };


  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
    department: '',
    photo: ''
  });

  // Subdomain
  const { subdomain } = useContext(appContext);

  // Load workers and departments
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setIsLoadingDepartments(true);
      
      try {
        const [workersData, departmentsData] = await Promise.all([
          getWorkers(),
          getDepartments()
        ]);

        // Ensure data is an array
        const safeWorkersData = Array.isArray(workersData) ? workersData : [];
        const safeDepartmentsData = Array.isArray(departmentsData) ? departmentsData : [];

        setWorkers(safeWorkersData);
        setDepartments(safeDepartmentsData);
      } catch (error) {
        toast.error('Failed to load data');
        console.error(error);
        // Set to empty arrays in case of error
        setWorkers([]);
        setDepartments([]);
      } finally {
        setIsLoading(false);
        setIsLoadingDepartments(false);
      }
    };
    
    loadData();
  }, []);

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Filter workers
  const filteredWorkers = Array.isArray(workers) 
    ? workers.filter(
        worker =>
          worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (worker.department && worker.department.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : [];

  // Open add worker modal
  const openAddModal = () => {
    setFormData({
      name: '',
      username: '',
      password: '',
      department: departments.length > 0 ? departments[0]._id : '', // Ensure first department is selected
      photo: ''
    });
    setIsAddModalOpen(true);
  };



// Open edit worker modal
const openEditModal = (worker) => {
  // Determine the correct department ID
  const departmentId = typeof worker.department === 'object' 
    ? worker.department._id 
    : (departments.find(dept => dept.name === worker.department)?._id || worker.department);

  setSelectedWorker(worker);
  setFormData({
    name: worker.name,
    username: worker.username,
    department: departmentId, // Use the department ID
    photo: worker.photo || '',
    password: '',
    confirmPassword: ''
  });
  setIsEditModalOpen(true);
};
  // Open delete worker modal
  const openDeleteModal = (worker) => {
    setSelectedWorker(worker);
    setIsDeleteModalOpen(true);
  };

  // Handle add worker
  const handleAddWorker = async (e) => {
    e.preventDefault();
    
    const trimmedName = formData.name.trim();
    const trimmedUsername = formData.username.trim();
    const trimmedPassword = formData.password.trim();

    // Validation checks
    if (!subdomain || subdomain == 'main') {
      toast.error('Subdomain is missing, check the url');
      return;
    }

    if (!trimmedName) {
      toast.error('Name is required and cannot be empty');
      return;
    }
    
    if (!trimmedUsername) {
      toast.error('Username is required and cannot be empty');
      return;
    }
    
    if (!trimmedPassword) {
      toast.error('Password is required and cannot be empty');
      return;
    }
    
    if (!formData.department) {
      toast.error('Department is required');
      return;
    }
  
    try {
      const newWorker = await createWorker({
        ...formData,
        name: trimmedName,
        username: trimmedUsername,
        subdomain,
        password: trimmedPassword,
        photo: formData.photo || ''
      });
      
      setWorkers(prev => [...prev, newWorker]);
      setIsAddModalOpen(false);
      toast.success('Worker added successfully');
    } catch (error) {
      console.error('Add Worker Error:', error);
      toast.error(error.message || 'Failed to add worker');
    }
  };

  // Handle edit worker
  const handleEditWorker = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!formData.name || !formData.username || !formData.department) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Password validation if provided
    if (formData.password) {
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters long');
        return;
      }
    }
    
    try {
      const updateData = { 
        name: formData.name,
        username: formData.username,
        department: formData.department // Always include department
      };
      
      // Only add password if provided
      if (formData.password) {
        updateData.password = formData.password;
      }
      
      // Only include photo if a new file is selected
      if (formData.photo instanceof File) {
        updateData.photo = formData.photo;
      }
      
      const updatedWorker = await updateWorker(selectedWorker._id, updateData);
      
      setWorkers(prev =>
        prev.map(worker =>
          worker._id === selectedWorker._id ? {
            ...updatedWorker,
            department: departments.find(dept => dept._id === updatedWorker.department)?.name || updatedWorker.department
          } : worker
        )
      );
      
      setIsEditModalOpen(false);
      toast.success('Worker updated successfully');
    } catch (error) {
      console.error('Update Error:', error);
      toast.error(error.message || 'Failed to update worker');
    }
  };
  // Handle delete worker
  const handleDeleteWorker = async () => {
    try {
      await deleteWorker(selectedWorker._id);
      setWorkers(prev => prev.filter(worker => worker._id !== selectedWorker._id));
      setIsDeleteModalOpen(false);
      toast.success('Worker deleted successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to delete worker');
    }
  };

  // Table columns configuration
  const columns = [
    {
      header: 'Name',
      accessor: 'name'
    },
    {
      header: 'Username',
      accessor: 'username'
    },
    {
      header: 'Department',
      accessor: 'department'
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (worker) => (
        <div className="flex space-x-2">
          <button 
            onClick={() => openEditModal(worker)}
            className="p-1 text-blue-600 hover:text-blue-800"
          >
            <FaEdit />
          </button>
          <button 
            onClick={() => openDeleteModal(worker)}
            className="p-1 text-red-600 hover:text-red-800"
          >
            <FaTrash />
          </button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Worker Management</h1>
        <Button
          variant="primary"
          onClick={openAddModal}
        >
          <FaPlus className="mr-2" /> Add Worker
        </Button>
      </div>
      
      <Card>
        <div className="mb-4">
          <input
            type="text"
            className="form-input"
            placeholder="Search by name or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : (
          <Table
            columns={columns}
            data={filteredWorkers}
            noDataMessage="No workers found."
          />
        )}
      </Card>
      
      {/* Add Worker Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Worker"
      >
        <form onSubmit={handleAddWorker}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-input"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="department" className="form-label">Department</label>
            <select
  id="department"
  name="department" 
  value={formData.department}
  onChange={handleChange}
  required
>
  {departments.length === 0 ? (
    <option value="">No departments available</option>
  ) : (
    <>
      <option value="">Select Department</option>
      {departments.map(dept => (
        <option key={dept._id} value={dept._id}>
          {dept.name}
        </option>
      ))}
    </>
  )}
</select>
          </div>

          <div className="form-group">
            <label htmlFor="photo" className="form-label">Photo</label>
            <input
              type="file"
              id="photo"
              name="photo"
              className="form-input"
              onChange={handlePhotoChange}
              accept="image/*"
            />
          </div>
          
          <div className="flex justify-end mt-6 space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              Add Worker
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Worker Modal */}
{/* Edit Worker Modal */}
{/* Edit Worker Modal */}
<Modal
  isOpen={isEditModalOpen}
  onClose={() => setIsEditModalOpen(false)}
  title={`Edit Worker: ${selectedWorker?.name}`}
>
  <form onSubmit={handleEditWorker}>
    <div className="form-group">
      <label htmlFor="edit-name" className="form-label">Name</label>
      <input
        type="text"
        id="edit-name"
        name="name"
        className="form-input"
        value={formData.name}
        onChange={handleChange}
        required
      />
    </div>
    
    <div className="form-group">
      <label htmlFor="edit-username" className="form-label">Username</label>
      <input
        type="text"
        id="edit-username"
        name="username"
        className="form-input"
        value={formData.username}
        onChange={handleChange}
        required
      />
    </div>
    
    {/* New Password Fields */}
    <div className="form-group">
      <label htmlFor="edit-password" className="form-label">New Password (optional)</label>
      <input
        type="password"
        id="edit-password"
        name="password"
        className="form-input"
        value={formData.password}
        onChange={handleChange}
        placeholder="Leave blank to keep current password"
      />
    </div>
    
    <div className="form-group">
      <label htmlFor="edit-confirm-password" className="form-label">Confirm New Password</label>
      <input
        type="password"
        id="edit-confirm-password"
        name="confirmPassword"
        className="form-input"
        value={formData.confirmPassword || ''}
        onChange={handleChange}
        placeholder="Confirm new password"
      />
    </div>
    
    <div className="form-group">
      <label htmlFor="edit-photo" className="form-label">Photo</label>
      <div className="flex items-center">
        {selectedWorker?.photo && (
          <img 
            src={`/uploads/${selectedWorker.photo}`} 
            alt="Current Photo" 
            className="w-20 h-20 rounded-full object-cover mr-4"
          />
        )}
        <input
          type="file"
          id="edit-photo"
          name="photo"
          className="form-input"
          onChange={handlePhotoChange}
          accept="image/*"
        />
      </div>
    </div>

    <div className="form-group">
  <label htmlFor="edit-department" className="form-label">Department</label>
  <select
  id="edit-department"
  name="department"
  className="form-input"
  value={formData.department}
  onChange={handleChange}
  required
>
  {departments.map((dept) => (
    <option 
      key={dept._id} 
      value={dept._id}
    >
      {dept.name}
    </option>
  ))}
</select>
</div>
    
    <div className="flex justify-end mt-6 space-x-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsEditModalOpen(false)}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        variant="primary"
      >
        Update Worker
      </Button>
    </div>
  </form>
</Modal>
      {/* Delete Worker Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Worker"
      >
        <p className="mb-4">
          Are you sure you want to delete <strong>{selectedWorker?.name}</strong>?
          This action cannot be undone.
        </p>
        
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsDeleteModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteWorker}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default WorkerManagement;