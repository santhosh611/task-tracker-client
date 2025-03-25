import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { getTopics, createTopic, updateTopic, deleteTopic } from '../../services/topicService';
import { getDepartments } from '../../services/departmentService';
import Card from '../common/Card';
import Button from '../common/Button';
import Table from '../common/Table';
import Modal from '../common/Modal';
import Spinner from '../common/Spinner';

const TopicManagement = () => {
  const [topics, setTopics] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    points: 0,
    department: ''
  });
  
  // Load topics and departments
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [topicsData, departmentsData] = await Promise.all([
          getTopics(),
          getDepartments()
        ]);
        setTopics(topicsData);
        setDepartments(departmentsData);
      } catch (error) {
        toast.error('Failed to load data');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Filter topics based on search term and department
  const filteredTopics = topics.filter(
    topic =>
      topic.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterDepartment === '' || topic.department === filterDepartment || topic.department === 'all')
  );
  
  // Open add topic modal
  const openAddModal = () => {
    setFormData({
      name: '',
      points: 0,
      department: 'all'
    });
    setIsAddModalOpen(true);
  };
  
  // Open edit topic modal
  const openEditModal = (topic) => {
    setSelectedTopic(topic);
    setFormData({
      name: topic.name,
      points: topic.points,
      department: topic.department
    });
    setIsEditModalOpen(true);
  };
  
  // Open delete topic modal
  const openDeleteModal = (topic) => {
    setSelectedTopic(topic);
    setIsDeleteModalOpen(true);
  };
  
  // Handle add topic form submit
  const handleAddTopic = async (e) => {
    e.preventDefault();
    
    if (!formData.name || formData.points < 0) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      const newTopic = await createTopic(formData);
      setTopics(prev => [...prev, newTopic]);
      setIsAddModalOpen(false);
      toast.success('Topic added successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to add topic');
    }
  };
  
  // Handle edit topic form submit
  const handleEditTopic = async (e) => {
    e.preventDefault();
    
    if (!formData.name || formData.points < 0) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      const updatedTopic = await updateTopic(selectedTopic._id, formData);
      setTopics(prev =>
        prev.map(topic =>
          topic._id === selectedTopic._id ? updatedTopic : topic
        )
      );
      setIsEditModalOpen(false);
      toast.success('Topic updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update topic');
    }
  };
  
  // Handle delete topic
  const handleDeleteTopic = async () => {
    try {
      await deleteTopic(selectedTopic._id);
      setTopics(prev => prev.filter(topic => topic._id !== selectedTopic._id));
      setIsDeleteModalOpen(false);
      toast.success('Topic deleted successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to delete topic');
    }
  };
  
  // Table columns configuration
  const columns = [
    {
      header: 'Name',
      accessor: 'name'
    },
    {
      header: 'Points',
      accessor: 'points'
    },
    {
      header: 'Department',
      accessor: 'department',
      render: (topic) => topic.department === 'all' ? 'All Departments' : topic.department
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (topic) => (
        <div className="flex space-x-2">
          <button 
            onClick={() => openEditModal(topic)}
            className="p-1 text-blue-600 hover:text-blue-800"
            title="Edit Topic"
          >
            <FaEdit />
          </button>
          <button 
            onClick={() => openDeleteModal(topic)}
            className="p-1 text-red-600 hover:text-red-800"
            title="Delete Topic"
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
        <h1 className="text-2xl font-bold">Topic Management</h1>
        <Button
          variant="primary"
          onClick={openAddModal}
        >
          <FaPlus className="mr-2" /> Add Topic
        </Button>
      </div>
      
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <input
              type="text"
              className="form-input"
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select
              className="form-input"
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
            >
              <option value="">All Departments</option>
              <option value="all">General Topics</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : (
          <Table
            columns={columns}
            data={filteredTopics}
            noDataMessage="No topics found."
          />
        )}
      </Card>
      
      {/* Add Topic Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Topic"
      >
        <form onSubmit={handleAddTopic}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">Topic Name</label>
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
            <label htmlFor="points" className="form-label">Points</label>
            <input
              type="number"
              id="points"
              name="points"
              className="form-input"
              value={formData.points}
              onChange={handleChange}
              min="0"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="department" className="form-label">Department</label>
            <select
              id="department"
              name="department"
              className="form-input"
              value={formData.department}
              onChange={handleChange}
              required
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
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
              Add Topic
            </Button>
          </div>
        </form>
      </Modal>
      
      {/* Edit Topic Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Topic: ${selectedTopic?.name}`}
      >
        <form onSubmit={handleEditTopic}>
          <div className="form-group">
            <label htmlFor="edit-name" className="form-label">Topic Name</label>
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
            <label htmlFor="edit-points" className="form-label">Points</label>
            <input
              type="number"
              id="edit-points"
              name="points"
              className="form-input"
              value={formData.points}
              onChange={handleChange}
              min="0"
              required
            />
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
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept.name}>
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
              Update Topic
            </Button>
          </div>
        </form>
      </Modal>
      
      {/* Delete Topic Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Topic"
      >
        <p className="mb-4">
          Are you sure you want to delete <strong>{selectedTopic?.name}</strong>?
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
            onClick={handleDeleteTopic}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default TopicManagement;