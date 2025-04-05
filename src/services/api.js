import axios from 'axios';

const api = axios.create({
  baseURL: 'https://task-tracker-backend-2jqf.onrender.com/api',
  withCredentials: true, // If you need cookies for CORS, otherwise can remove
});

// Track if we're currently refreshing to prevent infinite loops
let isRefreshing = false;
// Store pending requests to retry after refresh
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor: adds token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with token refresh logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 and 403 errors (unauthorized or forbidden)
    if ((error.response && (error.response.status === 401 || error.response.status === 403)) && 
        !originalRequest._retry) {
      
      if (isRefreshing) {
        // If we're already refreshing, queue this request
        return new Promise(function(resolve, reject) {
          failedQueue.push({resolve, reject});
        }).then(token => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return axios(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('Attempting token refresh...');
        
        // Get current user data to determine role
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        
        // Try to refresh the token with role information
        const response = await axios.post('${import.meta.env.VITE_API_BASE_URL/api/auth/refresh-token', 
          { role: currentUser.role }, // Send role in request body
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        if (response.data && response.data.token) {
          // Update token in localStorage
          localStorage.setItem('token', response.data.token);
          
          // Store the complete user object with role information
          if (response.data.user) {
            // Create merged user object with priority to new data
            const updatedUser = {
              ...currentUser,
              ...response.data.user,
              // Ensure role is explicitly set and preserved
              role: response.data.user.role || currentUser.role
            };
            
            localStorage.setItem('user', JSON.stringify(updatedUser));
            console.log('Updated user data:', updatedUser);
            
            // Verify the user role is what we expect for this request
            const requestPath = originalRequest.url;
            if (requestPath.includes('/comments') && updatedUser.role !== 'admin') {
              console.warn('Skipping retry of admin-only route with non-admin role');
              processQueue(new Error('Route requires admin privileges'));
              return Promise.reject(new Error('Access denied - admin privileges required'));
            }
          }
          
          console.log('Token refreshed successfully with role:', 
            response.data.user?.role || currentUser.role);
          
          // Process any queued requests
          processQueue(null, response.data.token);
          
          // Update auth header and retry original request
          originalRequest.headers['Authorization'] = `Bearer ${response.data.token}`;
          return axios(originalRequest);
        } else {
          processQueue(new Error('Failed to refresh token'));
          throw new Error('Failed to refresh token');
        }
      } catch (refreshError) {
        processQueue(refreshError);
        console.error('Token refresh failed:', refreshError);
        
        // Only redirect to login if it's a genuine auth failure
        if (refreshError.response && 
            (refreshError.response.status === 401 || refreshError.response.status === 403)) {
          console.log('Auth failed even after refresh attempt, redirecting to login');
          
          // Get user role from localStorage
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          const isAdmin = user.role === 'admin';
          
          // Clear current auth data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Show alert to user
          alert('Your session has expired. Please login again.');
          
          // Redirect based on user role after a short delay
          setTimeout(() => {
            if (isAdmin) {
              window.location.href = '/admin/login';
            } else {
              window.location.href = '/worker/login';
            }
          }, 100);
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;