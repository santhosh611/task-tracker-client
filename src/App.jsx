import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout';

// Public pages
import Home from './pages/Home';
import AdminLogin from './pages/Admin/AdminLogin';
import AdminRegister from './pages/Admin/AdminRegister';
import WorkerLogin from './pages/Worker/WorkerLogin';


// Protected pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import WorkerDashboard from './pages/Worker/WorkerDashboard';

// Management Pages
import WorkerManagement from './components/admin/WorkerManagement';
import DepartmentManagement from './components/admin/DepartmentManagement';
import ColumnManagement from './components/admin/ColumnManagement';
import TaskManagement from './components/admin/TaskManagement';
import LeaveManagement from './components/admin/LeaveManagement';
import CommentManagement from './components/admin/CommentManagement';
import TopicManagement from './components/admin/TopicManager';
import FoodRequestManagement from './components/admin/FoodRequestManagement';
import CustomTasks from './components/admin/CustomTasks';
// Protected route component
import PrivateRoute from './components/common/PrivateRoute';

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/register" element={<AdminRegister />} />
      <Route path="/worker/login" element={<WorkerLogin />} />
      
      {/* Protected Admin routes with Layout */}
      <Route element={<PrivateRoute allowedRoles={['admin']} />}>
        <Route path="/admin/*" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="workers" element={<WorkerManagement />} />
          <Route path="departments" element={<DepartmentManagement />} />
          <Route path="columns" element={<ColumnManagement />} />
          <Route path="tasks" element={<TaskManagement />} />
          <Route path="leaves" element={<LeaveManagement />} />
          <Route path="comments" element={<CommentManagement />} />
          <Route path="topics" element={<TopicManagement />} />
          <Route path="food-requests" element={<FoodRequestManagement />} />
          <Route path="custom-tasks" element={<CustomTasks />} />
          {/* Catch-all route for unknown admin paths */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Route>
      
      {/* Protected Worker routes */}
      <Route element={<PrivateRoute allowedRoles={['worker']} />}>
        <Route path="/worker/*" element={<WorkerDashboard />}>
          {/* You can add nested worker routes here if needed */}
          <Route path="*" element={<Navigate to="/worker" replace />} />
        </Route>
      </Route>

      {/* 404 Not Found Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;