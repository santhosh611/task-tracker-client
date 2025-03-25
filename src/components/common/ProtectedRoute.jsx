import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Spinner from './Spinner';

const ProtectedRoute = ({ children, isAllowed, redirectPath, adminOnly = false, workerOnly = false }) => {
  const { isAuthenticated, isAdmin, isWorker, loading } = useAuth();
  
  // Show loading state while checking authentication
  if (loading) {
    return <Spinner />;
  }
  
  const hasPermission = isAllowed && 
                        (!adminOnly || isAdmin) && 
                        (!workerOnly || isWorker);
  
  // Redirect if not authenticated or permissions don't match
  if (!isAuthenticated || !hasPermission) {
    return <Navigate to={redirectPath} replace />;
  }
  
  return children;
};

export default ProtectedRoute;