import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  FaHome,
  FaCalendarPlus,
  FaCalendarCheck,
  FaComments,
  FaPizzaSlice,
  FaRegCalendarCheck,
  FaRegBell

} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { getMyLeaves } from '../../services/leaveService';
import {
  getMyComments,
  getUnreadAdminReplies
} from '../../services/commentService';
import Sidebar from './Sidebar';
import appContext from '../../context/AppContext';

const WorkerLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const [newComments, setNewComments] = useState(0);
  const [leaveUpdates, setLeaveUpdates] = useState(0);
  const navigate = useNavigate();
  const { subdomain } = useContext(appContext);

  // Check for new comments and leave updates
  useEffect(() => {
    const fetchNotificationCounts = async () => {
      try {
        if (!subdomain || subdomain == 'main') {
          return;
        }

        // Fetch leaves
        const leaves = await getMyLeaves({ subdomain });
        const unviewedLeaves = leaves.filter(leave =>
          !leave.workerViewed &&
          (leave.status === 'Pending' || leave.status === 'Approved')
        ).length;
        setLeaveUpdates(unviewedLeaves);

        // Fetch comments
        const comments = await getMyComments();
        const unreadAdminReplies = await getUnreadAdminReplies();

        const newUnreadComments = comments.filter(comment =>
          comment.isNew ||
          (comment.replies && comment.replies.some(reply => reply.isNew))
        ).length;

        // Add unread admin replies to notification count
        setNewComments(newUnreadComments + unreadAdminReplies.length);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    // Fetch immediately on mount
    fetchNotificationCounts();

    // Set up periodic refresh (every 5 minutes)
    const intervalId = setInterval(fetchNotificationCounts, 5 * 60 * 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/worker/login');
  };

  const sidebarLinks = [
    {
      to: '/worker',
      icon: <FaHome style={{ color: '#4A90E2' }} />,
      label: 'Dashboard'
    },
    {
      to: '/worker/attendance',
      icon: <FaRegCalendarCheck style={{ color: '#7ED321' }} />,
      label: 'Attendance Report'
    },
    {
      to: '/worker/food-request',
      icon: <FaPizzaSlice style={{ color: '#F5A623' }} />,
      label: 'Food Request'
    },
    {
      to: '/worker/leave-apply',
      icon: <FaCalendarPlus style={{ color: '#9B59B6' }} />,
      label: 'Apply for Leave'
    },
    {
      to: '/worker/leave-requests',
      icon: <FaCalendarCheck style={{ color: '#D0021B' }} />,
      label: 'Leave Requests',
      badge: leaveUpdates > 0 ? leaveUpdates : null
    },
    {
      to: '/worker/notifications',
      icon: <FaRegBell style={{ color: '#ccffcc' }} />,
      label: 'Notifications',
      badge: newComments > 0 ? newComments : null
    },
    {
      to: '/worker/comments',
      icon: <FaComments style={{ color: '#1ABC9C' }} />,
      label: 'Comments',
      badge: newComments > 0 ? newComments : null
    }
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        links={sidebarLinks}
        logoText="Worker Dashboard"
        user={{
          ...user,
          displayName: `${user.name} (${user.department})` // Show name and department
        }}
        onLogout={handleLogout}
      />

      <div className="flex-1 overflow-auto md:ml-64">
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default WorkerLayout;