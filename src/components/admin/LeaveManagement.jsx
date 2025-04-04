import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import { format } from 'date-fns';
import {
  getLeavesByStatus,
  updateLeaveStatus,
  markLeavesAsViewedByAdmin
} from '../../services/leaveService';
import Card from '../common/Card';
import Spinner from '../common/Spinner';
import Button from '../common/Button';
import { getImageUrl } from '../../utils/imageUtils';


const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
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
  }, [statusFilter]);

  const loadLeaves = async () => {
    setIsLoading(true);
    try {
      // Make sure we're admin before fetching leaves
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (currentUser.role !== 'admin') {
        console.error('Non-admin user trying to access leave management');
        toast.error('Access denied. Please log in with admin credentials.');
        setTimeout(() => logout(), 2000);
        return;
      }
      
      const leavesData = await getLeavesByStatus(statusFilter);
      
      const safeLeaves = Array.isArray(leavesData) ? leavesData : [];
      setLeaves(safeLeaves);
    } catch (error) {
      toast.error('Failed to load leave requests');
      console.error('Leave Loading Error:', error);
      setLeaves([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveLeave = async (leaveId) => {
    try {
      await updateLeaveStatus(leaveId, 'Approved');
      toast.success('Leave request approved');
      loadLeaves();
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
    } catch (error) {
      toast.error('Failed to reject leave request');
      console.error('Reject Leave Error:', error);
    }
  };


  const handleDownloadAttachment = (url) => {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'attachment');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      <h1 className="text-2xl font-bold mb-6">Leave Management</h1>

      <div className="mb-4">
        <button
          className={`mr-2 py-2 px-4 ${
            statusFilter === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
          onClick={() => setStatusFilter('all')}
        >
          All
        </button>
        <button
          className={`mr-2 py-2 px-4 ${
            statusFilter === 'Pending'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
          onClick={() => setStatusFilter('Pending')}
        >
          Pending
        </button>
        <button
          className={`mr-2 py-2 px-4 ${
            statusFilter === 'Approved'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
          onClick={() => setStatusFilter('Approved')}
        >
          Approved
        </button>
        <button
          className={`py-2 px-4 ${
            statusFilter === 'Rejected'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
          onClick={() => setStatusFilter('Rejected')}
        >
          Rejected
        </button>
      </div>

      <Card>
        {leaves.length === 0 ? (
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
          Requested by: {(() => {
            // Defensive rendering with detailed checks
            if (leave.worker && leave.worker.name) {
              const departmentName = leave.worker.department 
                ? (typeof leave.worker.department === 'object' 
                  ? leave.worker.department.name 
                  : leave.worker.department)
                : 'No Department';
              return `${leave.worker.name} (${departmentName})`;
            }
            return 'Unknown Worker (No Department)';
          })()}
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
                      <Button
                        variant="link"
                        onClick={() => handleDownloadAttachment(leave.document)}
                      >
                        View Attachment
                      </Button>
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