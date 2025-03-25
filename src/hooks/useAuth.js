import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  // Add some additional helper methods
  return {
    ...context,
    isAuthenticated: () => {
      const token = localStorage.getItem('token');
      return !!(token && context.user);
    },
    hasRole: (roles) => {
      return context.user && roles.includes(context.user.role);
    }
  };
};