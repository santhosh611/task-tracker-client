import { Routes, Route, Navigate } from 'react-router-dom';
import WorkerLayout from '../../components/layout/WorkerLayout';
import Dashboard from '../../components/worker/Dashboard';
import LeaveApplication from '../../components/worker/ApplyForLeave';
import LeaveRequests from '../../components/worker/LeaveRequests';
import Comments from '../../components/worker/Comments';
import FoodRequest from '../../components/worker/FoodRequest';
import AttendanceReport from '../../components/worker/AttendanceReport';
import Notifications from '../../components/worker/Notifications';

const WorkerDashboard = () => {
  return (
    <WorkerLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/attendance" element={<AttendanceReport />} />
        <Route path="/leave-apply" element={<LeaveApplication />} />
        <Route path="/leave-requests" element={<LeaveRequests />} />
        <Route path="/comments" element={<Comments />} />
        <Route path="/food-request" element={<FoodRequest />} />
        <Route path="/notifications" element={<Notifications />} />
        
        {/* Redirect to dashboard for unknown routes */}
        <Route path="*" element={<Navigate to="/worker" replace />} />
      </Routes>
    </WorkerLayout>
  );
};

export default WorkerDashboard;