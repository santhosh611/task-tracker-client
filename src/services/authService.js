import api from '../services/api';

export const registerAdmin = async (userData) => {
  try {
    const response = await api.post('/auth/admin/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Failed to register admin');
  }
};

export const login = async (credentials, userType) => {
  try {
    const response = await api.post(`/auth/${userType}`, credentials);
    const userData = response.data;
    
    // Store complete user data with role information
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify({
      _id: userData._id,
      username: userData.username,
      email: userData.email,
      role: userData.role, // Make sure role is stored
      name: userData.name,
      department: userData.department
    }));

    return userData;
  } catch (error) {
    throw error;
  }
};


export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  try {
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');
    
    if (token && userJson) {
      const user = JSON.parse(userJson);
      return {
        ...user,
        token
      };
    }
    return null;
  } catch (error) {
    console.error('Error retrieving user:', error);
    return null;
  }
};

// Corrected initialization check
export const checkAndInitAdmin = async () => {
  try {
    const response = await api.get('/auth/check-admin');
    return response.data;
  } catch (error) {
    console.error('Admin check failed:', error);
    throw error;
  }
};

export const refreshTokenService = async () => {
  try {
    // Add user info to request body to ensure correct role handling
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    
    const response = await api.post('/auth/refresh-token', {
      role: currentUser.role // Send role in request body
    });
    
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
      
      // Update user data with received data
      if (response.data.user) {
        // Merge existing user data with new data
        const updatedUser = {
          ...currentUser,
          ...response.data.user
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    }
    
    return response.data;
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw error;
  }
};
export default {
  registerAdmin,
  login,
  logout,
  getCurrentUser,
  checkAndInitAdmin,
  refreshTokenService
};