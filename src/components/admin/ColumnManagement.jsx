import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { getColumns, createColumn, updateColumn, deleteColumn } from '../../services/columnService';
import { getDepartments } from '../../services/departmentService';
import Card from '../common/Card';
import Button from '../common/Button';
import Table from '../common/Table';
import Modal from '../common/Modal';
import Spinner from '../common/Spinner';

const ColumnManagement = () => {
  const [columns, setColumns] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    department: ''
  });
  
  // Load columns and departments
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [columnsData, departmentsData] = await Promise.all([
          getColumns(),
          getDepartments()
        ]);
        
        // Ensure columnsData is an array
        const safeColumnsData = Array.isArray(columnsData) ? columnsData : [];
        const safeDepartmentsData = Array.isArray(departmentsData) ? departmentsData : [];
        
        setColumns(safeColumnsData);
        setDepartments(safeDepartmentsData);
      } catch (error) {
        toast.error('Failed to load data');
        console.error(error);
        // Set to empty arrays in case of error
        setColumns([]);
        setDepartments([]);
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
  
  // Filter columns based on search term and department
  const filteredColumns = Array.isArray(columns) 
    ? columns.filter(column => {
        // Ensure column is not undefined and has required properties
        if (!column || typeof column !== 'object') return false;

        const nameMatch = column.name && 
          column.name.toLowerCase().includes(searchTerm.toLowerCase());
        
        const departmentMatch = 
          filterDepartment === '' || 
          column.department === filterDepartment || 
          column.department === 'all';
        
        return nameMatch && departmentMatch;
      })
    : [];
  
  // Open add column modal
  const openAddModal = () => {
    setFormData({
      name: '',
      department: 'all'
    });
    setIsAddModalOpen(true);
  };
  
  // Open edit column modal
  const openEditModal = (column) => {
    setSelectedColumn(column);
    setFormData({
      name: column.name,
      department: column.department
    });
    setIsEditModalOpen(true);
  };
  
  // Open delete column modal
  const openDeleteModal = (column) => {
    setSelectedColumn(column);
    setIsDeleteModalOpen(true);
  };
  
  // Handle add column form submit
  const handleAddColumn = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('Please enter a column name');
      return;
    }
    
    try {
      const newColumn = await createColumn(formData);
      setColumns(prev => [...prev, newColumn]);
      setIsAddModalOpen(false);
      toast.success('Column added successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to add column');
    }
  };
  
  // Handle edit column form submit
  const handleEditColumn = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('Please enter a column name');
      return;
    }
    
    try {
      const updatedColumn = await updateColumn(selectedColumn._id, formData);
      setColumns(prev =>
        prev.map(column =>
          column._id === selectedColumn._id ? updatedColumn : column
        )
      );
      setIsEditModalOpen(false);
      toast.success('Column updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update column');
    }
  };
  
  // Handle delete column
  const handleDeleteColumn = async () => {
    try {
      await deleteColumn(selectedColumn._id);
      setColumns(prev => prev.filter(column => column._id !== selectedColumn._id));
      setIsDeleteModalOpen(false);
      toast.success('Column deleted successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to delete column');
    }
  };
  
  // Render department options safely
  const renderDepartmentOptions = () => {
    const safeDepartments = Array.isArray(departments) ? departments : [];
    
    return (
      <>
        <option value="all">All Departments</option>
        {safeDepartments.map((dept) => (
          <option key={dept._id} value={dept.name}>
            {dept.name}
          </option>
        ))}
      </>
    );
  };
  
  // Table columns configuration
  const tableColumns = [
    {
      header: 'Name',
      accessor: 'name'
    },
    {
      header: 'Department',
      accessor: 'department',
      render: (column) => column.department === 'all' ? 'All Departments' : column.department
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (column) => (
        <div className="flex space-x-2">
          <button 
            onClick={() => openEditModal(column)}
            className="p-1 text-blue-600 hover:text-blue-800"
            title="Edit Column"
          >
            <FaEdit />
          </button>
          <button 
            onClick={() => openDeleteModal(column)}
            className="p-1 text-red-600 hover:text-red-800"
            title="Delete Column"
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
        <h1 className="text-2xl font-bold">Column Management</h1>
        <Button
          variant="primary"
          onClick={openAddModal}
        >
          <FaPlus className="inline mr-2" /> Add Column
        </Button>
      </div>
      
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <input
              type="text"
              className="form-input"
              placeholder="Search columns..."
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
              {renderDepartmentOptions()}
            </select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : (
          <Table
            columns={tableColumns}
            data={filteredColumns}
            noDataMessage="No columns found."
          />
        )}
      </Card>
      
      {/* Add Column Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Column"
      >
        <form onSubmit={handleAddColumn}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">Column Name</label>
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
            <label htmlFor="department" className="form-label">Department</label>
            <select
              id="department"
              name="department"
              className="form-input"
              value={formData.department}
              onChange={handleChange}
              required
            >
              {renderDepartmentOptions()}
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
              Add Column
            </Button>
          </div>
        </form>
      </Modal>
      
      {/* Edit Column Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Column: ${selectedColumn?.name}`}
      >
        <form onSubmit={handleEditColumn}>
          <div className="form-group">
            <label htmlFor="edit-name" className="form-label">Column Name</label>
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
            <label htmlFor="edit-department" className="form-label">Department</label>
            <select
              id="edit-department"
              name="department"
              className="form-input"
              value={formData.department}
              onChange={handleChange}
              required
            >
              {renderDepartmentOptions()}
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
              Update Column
            </Button>
          </div>
        </form>
      </Modal>
      
      {/* Delete Column Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Column"
      >
        <p className="mb-4">
          Are you sure you want to delete <strong>{selectedColumn?.name}</strong>?
          This action cannot be undone and may affect existing task data.
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
            onClick={handleDeleteColumn}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ColumnManagement;