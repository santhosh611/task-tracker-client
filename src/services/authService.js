// src/services/authService.js
import api from '../hooks/useAxios';

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
    
    // Include department information
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify({
      _id: userData._id,
      username: userData.username,
      email: userData.email,
      role: userData.role,
      name: userData.name, // Add worker's full name
      department: userData.department // Add department name
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
    const currentToken = localStorage.getItem('token');
    
    if (!currentToken) {
      throw new Error('No token available');
    }
    
    const response = await api.post('/auth/refresh', { token: currentToken });
    
    // Update local storage with new token and user data
    const { token, ...user } = response.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user)); 
    
    return { token, user };
  } catch (error) {
    console.error('Token refresh failed', error);
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