import { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { getMyLeaves, markLeaveAsViewed } from '../../services/leaveService';
import Card from '../common/Card';
import Spinner from '../common/Spinner';
import Button from '../common/Button';
import appContext from '../../context/AppContext';


const LeaveRequests = () => {
  const [leaves, setLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { subdomain } = useContext(appContext);

  useEffect(() => {
    const loadLeaves = async () => {
      if (!subdomain || subdomain == 'main') {
        return;
      }

      setIsLoading(true);
      try {
        const leavesData = await getMyLeaves({ subdomain });
        const safeLeaves = Array.isArray(leavesData) ? leavesData : [];
        setLeaves(safeLeaves);

        // Mark leaves with updates as viewed
        const leavesWithUpdates = safeLeaves.filter(
          (leave) =>
            (leave.status === 'Approved' || leave.status === 'Rejected') &&
            !leave.workerViewed
        );

        if (leavesWithUpdates.length > 0) {
          for (const leave of leavesWithUpdates) {
            await markLeaveAsViewed(leave._id);
          }
        }
      } catch (error) {
        toast.error('Failed to load leave requests');
        console.error('Leave Loading Error:', error);
        setLeaves([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadLeaves();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  // Get status badge style
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return "bg-green-100 text-green-800";
      case 'Rejected':
        return "bg-red-100 text-red-800";
      case 'Pending':
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">My Leave Requests</h1>
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
      <h1 className="text-2xl font-bold mb-6">My Leave Requests</h1>

      <Card>
        {leaves.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>You haven't submitted any leave requests yet.</p>
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => window.location.href = '/worker/leave-apply'}
            >
              Apply for Leave
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {leaves.map((leave) => (
              <div
                key={leave._id}
                className={`border rounded-lg overflow-hidden ${!leave.workerViewed && (leave.status === 'Approved' || leave.status === 'Rejected')
                    ? 'border-blue-400 border-2'
                    : 'border-gray-200'
                  }`}
              >
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-medium text-gray-700">{leave.leaveType}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(leave.status)}`}>
                    {leave.status}
                  </span>
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
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Supporting Document</p>
                      <a
                        href={leave.document}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View Document
                      </a>
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

export default LeaveRequests;