import { createContext, useState, useEffect, useCallback } from 'react';
import { 
  login as loginService, 
  logout as logoutService, 
  getCurrentUser,
  refreshTokenService 
} from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = getCurrentUser();
        if (userData) {
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to load user', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (credentials, userType) => {
    setLoading(true);
    try {
      const userData = await loginService(credentials, userType);
      setUser(userData);
      return userData;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    logoutService();
    setUser(null);
  }, []);

  // New token refresh method
  const refreshToken = useCallback(async () => {
    try {
      const { token, user: updatedUser } = await refreshTokenService();
      
      // Update user context
      setUser(prevUser => ({
        ...prevUser,
        ...updatedUser,
        token
      }));
      
      return token;
    } catch (error) {
      console.error('Token refresh failed', error);
      logout();
      throw error;
    }
  }, [logout]);

  const value = {
    user,
    loading,
    login,
    logout,
    refreshToken,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isWorker: user?.role === 'worker',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};