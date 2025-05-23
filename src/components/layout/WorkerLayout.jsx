import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { 
  FaHome, 
  FaCalendarPlus, 
  FaCalendarCheck, 
  FaComments,
  FaPizzaSlice 
  
} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { getMyLeaves } from '../../services/leaveService';
import { 
  getMyComments, 
  getUnreadAdminReplies 
} from '../../services/commentService';
import Sidebar from './Sidebar';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';


const WorkerLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const [newComments, setNewComments] = useState(0);
  const [leaveUpdates, setLeaveUpdates] = useState(0);
  const navigate = useNavigate();
  
  // Check for new comments and leave updates
  useEffect(() => {
    const fetchNotificationCounts = async () => {
      try {
        // Fetch leaves
        const leaves = await getMyLeaves();
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
      icon: <FaHome />,
      label: 'Dashboard'
    },
    {
      to: '/worker/food-request', 
      icon: <FaPizzaSlice/>,  
      label: 'Food Request'
    },
    {
      to: '/worker/leave-apply',
      icon: <FaCalendarPlus />,
      label: 'Apply for Leave'
    },
    {
      to: '/worker/leave-requests',
      icon: <FaCalendarCheck />,
      label: 'Leave Requests',
      badge: leaveUpdates > 0 ? leaveUpdates : null
    },
    {
      to: '/worker/comments',
      icon: <FaComments />,
      label: 'Comments',
      badge: newComments > 0 ? newComments : null
    }
  ];
  // Add this inside your WorkerLayout component
console.log("User data in layout:", user);
console.log("Photo URL being passed to sidebar:", user.photo ? `${API_BASE_URL}/uploads/${user.photo}` : null);
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        links={sidebarLinks}
        logoText="Worker Dashboard"
        user={{
          ...user,
          displayName: `${user.name} (${user.department})`,
          // Provide the full URL to the photo if it exists
          photo: user.photo ? `${API_BASE_URL}/uploads/${user.photo}` : null
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