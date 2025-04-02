import { useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './useAuth';

const api = axios.create({
  baseURL: 'https://task-tracker-backend-2jqf.onrender.com/api',
  headers: { 
    'Content-Type': 'application/json' 
  }
});

export const useAxios = () => {
  const { user, logout, refreshToken } = useAuth();

  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      async (config) => {
        // Prioritize context token, fallback to localStorage
        let token = user?.token || localStorage.getItem('token');
        
        // Check if token needs refresh
        if (token && isTokenExpired(token)) {
          try {
            token = await refreshToken();
          } catch (error) {
            console.warn('Token refresh failed');
            logout();
            return config;
          }
        }
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // Handle 401 errors with token refresh attempt
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const newToken = await refreshToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          } catch (refreshError) {
            console.warn('Token refresh failed during request');
            logout();
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [user, logout, refreshToken]);

  return api;
};

// Utility to check if token is expired
const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return true;
    
    // Check if token is close to expiration (within 5 minutes)
    return Date.now() >= (decoded.exp - 5 * 60) * 1000;
  } catch (error) {
    return true;
  }
};

export default api;