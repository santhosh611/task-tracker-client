
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://task-tracker-backend-2jqf.onrender.com/api',
  withCredentials: true, // If you need cookies for CORS, otherwise can remove
});
// Add this to a page to check the token
console.log("Token exists:", !!localStorage.getItem('token'));
// Request interceptor: adds token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log("Adding token to request");
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log("No token found in localStorage");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handles 401 unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized access');
      // Optionally clear localStorage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default api;
