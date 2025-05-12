import { useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './useAuth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});
export const useAxios = () => {
  const { user, logout } = useAuth();

  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        // Prioritize context token, fallback to localStorage
        const token = user?.token || localStorage.getItem('token');

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('Request Token:', token);
        } else {
          console.warn('No token available for request');
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        // Log detailed error information
        console.error('API Error:', error);

        if (error.response) {
          console.error('Error Response:', error.response.data);
          console.error('Error Status:', error.response.status);

          // Automatically logout on 401 (Unauthorized) errors
          if (error.response.status === 401) {
            console.warn('Unauthorized: Logging out');
            logout();
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [user, logout]);

  return api;
};

export default api;