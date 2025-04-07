import { useState, useEffect,useRef } from 'react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import {
  getLeavesByStatus,
  updateLeaveStatus,
  markLeavesAsViewedByAdmin,
  getNewLeaveRequestsCount 
} from '../../services/leaveService';
import Card from '../common/Card';
import Spinner from '../common/Spinner';
import Button from '../common/Button';
import { getImageUrl } from '../../utils/imageUtils';

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newLeaveRequestsCount, setNewLeaveRequestsCount] = useState(0);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterMenuRef = useRef(null);

  // Add these state variables
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    const markLeavesViewed = async () => {
      try {
        await markLeavesAsViewedByAdmin();
      } catch (error) {
        console.error('Error marking leaves as viewed:', error);
      }
    };
  
    markLeavesViewed();
    loadLeaves();
  }, []); 

  useEffect(() => {
    const fetchNewLeaveRequestsCount = async () => {
      try {
        const count = await getNewLeaveRequestsCount();
        setNewLeaveRequestsCount(count);
      } catch (error) {
        console.error('Failed to fetch new leave requests:', error);
      }
    };

    fetchNewLeaveRequestsCount();
    // Refresh count periodically
    const intervalId = setInterval(fetchNewLeaveRequestsCount, 60000); // Every minute

    return () => clearInterval(intervalId);
  }, []);


  useEffect(() => {
    function handleClickOutside(event) {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setShowFilterMenu(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    loadLeaves();
  }, [statusFilter]);

  const loadLeaves = async () => {
    setIsLoading(true);
    try {
      const leavesData = await getLeavesByStatus(statusFilter);
      const safeLeaves = Array.isArray(leavesData) ? leavesData : [];
      setLeaves(safeLeaves);
      setFilteredLeaves(safeLeaves);
    } catch (error) {
      toast.error('Failed to load leave requests');
      console.error('Leave Loading Error:', error);
      setLeaves([]);
      setFilteredLeaves([]);
    } finally {
      setIsLoading(false);
    }
  };

const handleViewAttachment = (documentPath) => {
  if (!documentPath) return;
  
  // If it's a base64 string (from your current implementation)
  if (documentPath.startsWith('data:')) {
    window.open(documentPath, '_blank');
    return;
  }
  
  // For regular file paths
  const path = documentPath.startsWith('/') ? documentPath : `/${documentPath}`;
  window.open(`${window.location.origin}${path}`, '_blank');
};

  // Filter handler
  const handleFilter = () => {
    let result = leaves;
  
    if (selectedDepartment !== 'All Departments') {
      result = result.filter(leave => {
        const departmentName = typeof leave.worker?.department === 'object'
          ? leave.worker.department?.name
          : leave.worker?.department;
        return departmentName === selectedDepartment;
      });
    }
  
    if (dateFrom) {
      result = result.filter(leave => new Date(leave.startDate) >= new Date(dateFrom));
    }
  
    if (dateTo) {
      result = result.filter(leave => new Date(leave.endDate) <= new Date(dateTo));
    }
  
    setFilteredLeaves(result);
  };
  const handleApproveLeave = async (leaveId) => {
    try {
      await updateLeaveStatus(leaveId, 'Approved');
      toast.success('Leave request approved');
      loadLeaves();
      // Refresh new requests count after action
      const count = await getNewLeaveRequestsCount();
      setNewLeaveRequestsCount(count);
    } catch (error) {
      toast.error('Failed to approve leave request');
      console.error('Approve Leave Error:', error);
    }
  };

  const handleRejectLeave = async (leaveId) => {
    try {
      await updateLeaveStatus(leaveId, 'Rejected');
      toast.success('Leave request rejected');
      loadLeaves();
      // Refresh new requests count after action
      const count = await getNewLeaveRequestsCount();
      setNewLeaveRequestsCount(count);
    } catch (error) {
      toast.error('Failed to reject leave request');
      console.error('Reject Leave Error:', error);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      console.error('Date Formatting Error:', error);
      return dateString;
    }
  };

  // Get status badge style
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Leave Management</h1>
        <Card>
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        Leave Management
        {newLeaveRequestsCount > 0 && (
          <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            {newLeaveRequestsCount}
          </span>
        )}
      </h1>
  
      {/* Desktop filters - hidden on mobile */}
      <div className="hidden md:flex md:justify-between md:items-center mb-4">
        <div>
          <button
            className={`mr-2 py-2 px-4 rounded ${
              statusFilter === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => setStatusFilter('all')}
          >
            All
          </button>
          <button
            className={`mr-2 py-2 px-4 rounded ${
              statusFilter === 'Pending'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => setStatusFilter('Pending')}
          >
            Pending
          </button>
          <button
            className={`mr-2 py-2 px-4 rounded ${
              statusFilter === 'Approved'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => setStatusFilter('Approved')}
          >
            Approved
          </button>
          <button
            className={`py-2 px-4 rounded ${
              statusFilter === 'Rejected'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => setStatusFilter('Rejected')}
          >
            Rejected
          </button>
        </div>
  
        <div className="flex items-center space-x-4">
          <select 
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-4 py-2 border rounded"
          >
            <option>All Departments</option>
            {[...new Set(leaves.map(leave => 
              typeof leave.worker?.department === 'object' 
                ? leave.worker.department?.name 
                : leave.worker?.department
            ).filter(Boolean))].map(deptName => (
              <option key={deptName} value={deptName}>{deptName}</option>
            ))}
          </select>
  
          <input 
            type="date" 
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-4 py-2 border rounded"
            placeholder="From Date"
          />
  
          <input 
            type="date" 
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-4 py-2 border rounded"
            placeholder="To Date"
          />
  
          <button 
            onClick={handleFilter}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Filter
          </button>
        </div>
      </div>
  
      {/* Mobile filters */}
      <div className="md:hidden mb-4">
        {/* Status tabs for mobile - always visible */}
        <div className="flex w-full mb-3 overflow-x-auto pb-1 no-scrollbar">
          <button
            className={`mr-1 whitespace-nowrap py-2 px-3 rounded text-sm ${
              statusFilter === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => setStatusFilter('all')}
          >
            All
          </button>
          <button
            className={`mr-1 whitespace-nowrap py-2 px-3 rounded text-sm ${
              statusFilter === 'Pending'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => setStatusFilter('Pending')}
          >
            Pending
          </button>
          <button
            className={`mr-1 whitespace-nowrap py-2 px-3 rounded text-sm ${
              statusFilter === 'Approved'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => setStatusFilter('Approved')}
          >
            Approved
          </button>
          <button
            className={`whitespace-nowrap py-2 px-3 rounded text-sm ${
              statusFilter === 'Rejected'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => setStatusFilter('Rejected')}
          >
            Rejected
          </button>
        </div>
  
        {/* Filter controls for mobile */}
        <div className="flex items-center space-x-2">
          <select 
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border rounded"
          >
            <option>All Departments</option>
            {[...new Set(leaves.map(leave => 
              typeof leave.worker?.department === 'object' 
                ? leave.worker.department?.name 
                : leave.worker?.department
            ).filter(Boolean))].map(deptName => (
              <option key={deptName} value={deptName}>{deptName}</option>
            ))}
          </select>
  
          <button 
            onClick={handleFilter}
            className="px-3 py-2 bg-blue-500 text-white rounded text-sm"
          >
            Filter
          </button>
        </div>
  
        {/* Date filters for mobile */}
        <div className="flex items-center space-x-2 mt-2">
          <input 
            type="date" 
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border rounded"
            placeholder="From Date"
          />
  
          <input 
            type="date" 
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border rounded"
            placeholder="To Date"
          />
        </div>
      </div>
  
      <Card>
        {filteredLeaves.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No leave requests found.</p>
          </div>
        ) : (
        <div className="space-y-4">
          {leaves.map((leave) => (
            <div
              key={leave._id}
              className={`border rounded-lg overflow-hidden border-gray-200 ${
                !leave.workerViewed ? 'border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-gray-700">{leave.leaveType}</h3>
                  <p className="text-sm text-gray-500">
                    {leave.worker?.name || 'Unknown'} ({
                      typeof leave.worker?.department === 'object'
                        ? leave.worker.department?.name || 'No Department'
                        : leave.worker?.department || 'No Department'
                    })
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                    leave.status
                  )}`}
                >
                  {leave.status}
                </span>
              </div>
  
              <div className="p-4">
                <div className="flex items-center mb-4">
                  {leave.worker?.photo ? (
                    <img 
                      src={getImageUrl(leave.worker.photo)} 
                      alt={leave.worker?.name || 'Worker'}
                      className="w-8 h-8 rounded-full object-cover mr-2"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(leave.worker?.name || 'Unknown')}`;
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 mr-2">
                      {leave.worker?.name ? leave.worker.name.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}
                  <p className="text-sm text-gray-500">
                    {leave.worker?.name || 'Unknown'} ({leave.worker?.department || 'No Department'})
                  </p>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p>
                      {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                      <span className="text-sm text-gray-500 ml-1">
                        ({leave.totalDays} {leave.totalDays === 1 ? 'day' : 'days'})
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Submitted On</p>
                    <p>{formatDate(leave.createdAt)}</p>
                  </div>
                </div>
  
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Reason</p>
                  <p className="bg-gray-50 p-3 rounded-md">{leave.reason}</p>
                </div>
  
                {leave.document && (
  <div className="mb-4">
    <p className="text-sm text-gray-500 mb-1">Supporting Document</p>
    {leave.document.startsWith('http') ? (
      // Display Cloudinary image if URL starts with http
      <img 
        src={leave.document} 
        alt="Supporting document" 
        className="max-w-xs rounded-md border border-gray-200" 
        onClick={() => window.open(leave.document, '_blank')}
        style={{ cursor: 'pointer' }}
      />
    ) : (
      // Display "No image available" text if document URL is invalid
      <p>Image not available</p>
    )}
  </div>
)}
                {leave.status === 'Pending' && (
                  <div className="flex justify-end">
                    <button
                      className="py-2 px-4 bg-green-500 text-white rounded-md mr-2"
                      onClick={() => handleApproveLeave(leave._id)}
                    >
                      Approve
                    </button>
                    <button
                      className="py-2 px-4 bg-red-500 text-white rounded-md"
                      onClick={() => handleRejectLeave(leave._id)}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        )}
      </Card>
    </div>
  );
};

export default LeaveManagement;