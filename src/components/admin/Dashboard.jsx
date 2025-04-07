import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaTasks, FaColumns, FaCalendarAlt, FaComments } from 'react-icons/fa';
import { getWorkers } from '../../services/workerService';
import { getAllTasks } from '../../services/taskService';
import { getAllLeaves } from '../../services/leaveService';
import { getAllComments } from '../../services/commentService';
import { getTopics } from '../../services/topicService';
import { getColumns } from '../../services/columnService';
import Card from '../common/Card';
import Spinner from '../common/Spinner';
import appContext from '../../context/AppContext';

const Dashboard = () => {
  const [stats, setStats] = useState({
    workers: 0,
    tasks: 0,
    topics: 0,
    columns: 0,
    leaves: {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    },
    comments: {
      total: 0,
      unread: 0,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [topWorkers, setTopWorkers] = useState([]);
  const { subdomain } = useContext(appContext);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const [
          workersDataRaw,
          tasksDataRaw,
          topicsDataRaw,
          columnsDataRaw,
          leavesDataRaw,
          commentsDataRaw,
        ] = await Promise.all([
          getWorkers({ subdomain }),
          getAllTasks({ subdomain }),
          getTopics({ subdomain }),
          getColumns(),
          getAllLeaves(),
          getAllComments(),
        ]);

        // Defensive check: ensure leavesData is an array
        const workersData = Array.isArray(workersDataRaw) ? workersDataRaw : [];
        const tasksData = Array.isArray(tasksDataRaw) ? tasksDataRaw : [];
        const topicsData = Array.isArray(topicsDataRaw) ? topicsDataRaw : [];
        const columnsData = Array.isArray(columnsDataRaw) ? columnsDataRaw : [];
        const leavesData = Array.isArray(leavesDataRaw) ? leavesDataRaw : [];
        const commentsData = Array.isArray(commentsDataRaw) ? commentsDataRaw : [];

       // Calculate stats for leaves and comments
      const pendingLeaves = leavesData.filter(leave => leave.status === 'Pending');
      const approvedLeaves = leavesData.filter(leave => leave.status === 'Approved');
      const rejectedLeaves = leavesData.filter(leave => leave.status === 'Rejected');
      const unreadComments = commentsData.filter(comment => 
        comment.isNew || comment.replies?.some(reply => reply.isNew)
      );


      // Get top 5 workers by points
      const sortedWorkers = [...workersData]
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .slice(0, 5);

      setStats({
        workers: workersData.length,
        tasks: tasksData.length,
        topics: topicsData.length,
        columns: columnsData.length,
        leaves: {
          total: leavesData.length,
          pending: pendingLeaves.length,
          approved: approvedLeaves.length,
          rejected: rejectedLeaves.length,
        },
        comments: {
          total: commentsData.length,
          unread: unreadComments.length,
        },
      });

      setTopWorkers(sortedWorkers);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  loadDashboardData();
}, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-blue-50 border-l-4 border-blue-500">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-1">Workers</h3>
              <p className="text-2xl font-bold">{stats.workers}</p>
            </div>
            <FaUsers className="text-blue-500 text-3xl" />
          </div>
          <Link to="/admin/workers" className="text-blue-600 text-sm hover:underline block mt-2">
            Manage Workers →
          </Link>
        </Card>
        
        <Card className="bg-green-50 border-l-4 border-green-500">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-1">Tasks</h3>
              <p className="text-2xl font-bold">{stats.tasks}</p>
            </div>
            <FaTasks className="text-green-500 text-3xl" />
          </div>
          <Link to="/admin/tasks" className="text-green-600 text-sm hover:underline block mt-2">
            View Tasks →
          </Link>
        </Card>
        
        <Card className="bg-purple-50 border-l-4 border-purple-500">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-purple-800 mb-1">Topics</h3>
              <p className="text-2xl font-bold">{stats.topics}</p>
            </div>
            <FaTasks className="text-purple-500 text-3xl" />
          </div>
          <Link to="/admin/topics" className="text-purple-600 text-sm hover:underline block mt-2">
            Manage Topics →
          </Link>
        </Card>
        
        <Card className="bg-indigo-50 border-l-4 border-indigo-500">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-indigo-800 mb-1">Columns</h3>
              <p className="text-2xl font-bold">{stats.columns}</p>
            </div>
            <FaColumns className="text-indigo-500 text-3xl" />
          </div>
          <Link to="/admin/columns" className="text-indigo-600 text-sm hover:underline block mt-2">
            Manage Columns →
          </Link>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leave stats */}
        <Card title="Leave Requests">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-yellow-800">Pending</h4>
              <p className="text-xl font-bold text-yellow-800">{stats.leaves.pending}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-green-800">Approved</h4>
              <p className="text-xl font-bold text-green-800">{stats.leaves.approved}</p>
            </div>
          </div>
          <Link to="/admin/leaves" className="text-blue-600 text-sm hover:underline block mt-4">
            View All Leave Requests →
          </Link>
        </Card>
        
        {/* Top workers */}
        <Card title="Top Workers">
          <div className="space-y-4">
            {topWorkers.length > 0 ? (
              topWorkers.map((worker, index) => (
                <div key={worker._id} className="flex items-center">
                  <span className="text-lg font-bold w-8">{index + 1}</span>
                  <img
                    src={`http://localhost:5000${worker.photoUrl}` || `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.name)}`}
                    alt={worker.name}
                    className="w-10 h-10 rounded-full mr-3 object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{worker.name}</p>
                    <p className="text-sm text-gray-500">{worker.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{worker.totalPoints || 0}</p>
                    <p className="text-xs text-gray-500">points</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No worker data available.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
