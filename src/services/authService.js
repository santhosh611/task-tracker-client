import api from '../hooks/useAxios';

export const subdomainAvailable = async (formData) => {
  try {
    const response = await api.post('/auth/admin/subdomain-available', formData);
    return response.data;
  } catch (error) {
    console.error("Subdomain not available", error);
    throw error.response?.data || new Error('Failed to check subdomain availability');
  }
};

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
    localStorage.setItem('tasktracker-subdomain', userData.subdomain);
    localStorage.setItem('user', JSON.stringify({
      _id: userData._id,
      username: userData.username,
      subdomain: userData.subdomain,
      rfid: userData.rfid,
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
  localStorage.removeItem('tasktracker-subdomain');
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

export default {
  registerAdmin,
  login,
  logout,
  getCurrentUser,
  checkAndInitAdmin,
  subdomainAvailable
};