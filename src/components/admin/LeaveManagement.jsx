import { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { FaChevronDown, FaChevronUp, FaSearch } from 'react-icons/fa';
import { getAllLeaves, markLeavesAsViewedByAdmin, updateLeaveStatus } from '../../services/leaveService';
import appContext from '../../context/AppContext';
import Spinner from '../common/Spinner';

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  const [showAllLeaves, setShowAllLeaves] = useState(false);
  const [activeView, setActiveView] = useState('all');

  const [searchTerm, setSearchTerm] = useState('');
  const { subdomain } = useContext(appContext);

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const leavesData = await getAllLeaves({ subdomain });
        setLeaves(leavesData);
        setFilteredLeaves(leavesData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching leaves:', error);
        toast.error('Failed to load leave requests');
        setLoading(false);
      }
    };

    fetchLeaves();
  }, [subdomain]);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, activeView, leaves]);

  const applyFilters = () => {
    let result = [...leaves];

    if (activeView !== 'all') {
      result = result.filter(leave => leave.status === activeView);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(leave =>
        leave.worker?.name.toLowerCase().includes(term) ||
        leave.leaveType.toLowerCase().includes(term)
      );
    }

    setFilteredLeaves(result);
  };

  const handleReview = async (leaveId, status) => {
    setProcessing(prev => ({ ...prev, [leaveId]: true }));

    try {
      await updateLeaveStatus(leaveId, status);
      setLeaves(leaves.map(leave =>
        leave._id === leaveId ? { ...leave, status } : leave
      ));
      await markLeavesAsViewedByAdmin(leaveId);
      toast.success(`Leave ${status.toLowerCase()} successfully`);
    } catch (error) {
      toast.error(`Failed to ${status.toLowerCase()} leave`);
    } finally {
      setProcessing(prev => ({ ...prev, [leaveId]: false }));
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setActiveView('all');
  };

  const LeaveItem = ({ leave }) => (
    <div className="border rounded-md p-4 mb-4 bg-white">
      <div className="flex justify-between">
        <div>
          <p className="font-medium">{leave.worker?.name || 'Unknown Worker'}</p>
          <p className="text-sm text-gray-500">
            {leave.leaveType} • {new Date(leave.createdAt).toLocaleString()}
          </p>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            leave.status === 'Approved'
              ? 'bg-green-100 text-green-800'
              : leave.status === 'Rejected'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {leave.status}
        </span>
      </div>

      <p className="mt-2">{leave.reason}</p>

      {leave.status === 'Pending' && (
        <div className="mt-4 flex space-x-2">
          <button
            onClick={() => handleReview(leave._id, 'Approved')}
            disabled={processing[leave._id]}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Approve
          </button>
          <button
            onClick={() => handleReview(leave._id, 'Rejected')}
            disabled={processing[leave._id]}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );

  const displayLeaves = showAllLeaves ? filteredLeaves : filteredLeaves.slice(0, 5);

  const getTabClassName = (tabName) => {
    return `px-3 py-1 rounded-md cursor-pointer ${
      activeView === tabName
        ? 'bg-blue-600 text-white'
        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
    }`;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Leave Management</h1>

      {loading ? (
        <Spinner size="md" variant="default" />
      ) : leaves.length === 0 ? (
        <p>No leave requests submitted yet.</p>
      ) : (
        <div>
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by worker name or leave type"
                    className="pl-10 pr-4 py-2 w-full border rounded-md"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Clear Filters
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Leave List</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                Showing {displayLeaves.length} of {filteredLeaves.length} leaves
              </span>
              <button
                onClick={() => setShowAllLeaves(!showAllLeaves)}
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
              >
                {showAllLeaves ? (
                  <>Show Less {<FaChevronUp className="ml-1" />}</>
                ) : (
                  <>Show All {<FaChevronDown className="ml-1" />}</>
                )}
              </button>
            </div>
          </div>

          <div className="flex space-x-2 mb-4 overflow-x-auto">
            <div
              className={getTabClassName('all')}
              onClick={() => setActiveView('all')}
            >
              All Leaves
            </div>
            <div
              className={getTabClassName('Pending')}
              onClick={() => setActiveView('Pending')}
            >
              Pending
            </div>
            <div
              className={getTabClassName('Approved')}
              onClick={() => setActiveView('Approved')}
            >
              Approved
            </div>
            <div
              className={getTabClassName('Rejected')}
              onClick={() => setActiveView('Rejected')}
            >
              Rejected
            </div>
          </div>

          {displayLeaves.length === 0 ? (
            <div className="bg-white p-4 rounded-lg text-center">
              <p>No {activeView !== 'all' ? activeView : ''} leaves found with the current filters.</p>
            </div>
          ) : (
            <>
              {displayLeaves.map(leave => (
                <LeaveItem key={leave._id} leave={leave} />
              ))}

              {!showAllLeaves && filteredLeaves.length > 5 && (
                <button
                  onClick={() => setShowAllLeaves(true)}
                  className="mt-4 w-full py-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md"
                >
                  View All ({filteredLeaves.length}) Leaves
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;
