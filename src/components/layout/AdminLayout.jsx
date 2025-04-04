import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom'; // Add Outlet import
import { 
  FaHome, 
  FaUsers, 
  FaBuilding, 
  FaTasks, 
  FaColumns, 
  FaCalendarAlt, 
  FaComments, 
  FaTags,
  FaPizzaSlice,
  FaClipboardList,

} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { getAllLeaves } from '../../services/leaveService';
import { getNewLeaveRequestsCount } from '../../services/leaveService';
import { getAllComments } from '../../services/commentService';
import Sidebar from './Sidebar.jsx'

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const [pendingLeaves, setPendingLeaves] = useState(0);
  const [newComments, setNewComments] = useState(0);
  const navigate = useNavigate();
  const [newLeaveRequestsCount, setNewLeaveRequestsCount] = useState(0);
  
  // Check for new comments and leave updates
  useEffect(() => {
    const fetchNotificationCounts = async () => {
      try {
        // Fetch new leave request count using dedicated endpoint
        const newLeaveRequestCount = await getNewLeaveRequestsCount();
        setNewLeaveRequestsCount(newLeaveRequestCount);
  
        // Fetch comments count
        const comments = await getAllComments();
        const newUnreadComments = comments.filter(comment => 
          comment.isNew || 
          (comment.replies && comment.replies.some(reply => reply.isNew))
        ).length;
        setNewComments(newUnreadComments);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };
  
    fetchNotificationCounts();
    const intervalId = setInterval(fetchNotificationCounts, 5 * 60 * 1000);
  
    return () => clearInterval(intervalId);
  }, []);

  
  
  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };
  
  const sidebarLinks = [
    {
      to: '/admin',
      icon: <FaHome />,
      label: 'Dashboard'
    },
    {
      to: '/admin/workers',
      icon: <FaUsers />,
      label: 'Workers'
    },
    {
      to: '/admin/departments',
      icon: <FaBuilding />,
      label: 'Departments'
    },
    {
      to: '/admin/tasks',
      icon: <FaTasks />,
      label: 'Tasks'
    },
    {
      to: '/admin/food-requests',
      icon: <FaPizzaSlice />, 
      label: 'Food Requests'
    },
    {
      to: '/admin/columns',
      icon: <FaColumns />,
      label: 'columns'
    },
    {
      to: '/admin/topics',
      icon: <FaTags />,
      label: 'Topics'
    },
    {
      to: '/admin/custom-tasks',
      icon: <FaClipboardList />,
      label: 'Custom Tasks'
    },    
    {
      to: '/admin/leaves',
      icon: <FaCalendarAlt />,
      label: 'Leave Requests',
      badge: newLeaveRequestsCount > 0 ? newLeaveRequestsCount : null
    },
    {
      to: '/admin/comments',
      icon: <FaComments />,
      label: 'Comments',
      badge: newComments > 0 ? newComments : null
    }
  ];
  
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        links={sidebarLinks}
        logoText="Admin Dashboard"
        user={user}
        onLogout={handleLogout}
      />

      <div className="flex-1 overflow-auto md:ml-64">
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;