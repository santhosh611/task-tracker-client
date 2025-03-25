import api from '../hooks/useAxios';
import { getAuthToken } from '../utils/authUtils';

export const createDepartment = async (departmentData) => {
  try {
    if (!departmentData.name || departmentData.name.trim().length < 2) {
      throw new Error('Department name must be at least 2 characters long');
    }

    const normalizedName = departmentData.name.trim().toLowerCase();
    const token = getAuthToken();

    const response = await api.post('/departments', { name: normalizedName }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error) {
    console.error('Department Creation Error:', error);

    if (error.response) {
      console.error('Server Error Response:', error.response.data);
      throw new Error(error.response.data.message || 'Failed to create department');
    } else if (error.request) { 
      console.error('No Response Received:', error.request);
      throw new Error('No response from server. Please check your connection.');
    } else {
      console.error('Error Setting Up Request:', error.message);
      throw error;
    }
  }
};

export const getDepartments = async () => {
  try {
    const token = getAuthToken();
    
    const response = await api.get('/departments', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Departments API Response:', response.data);
    return Array.isArray(response.data) ? response.data : [];
    
  } catch (error) {
    // ... error handling ...
  }
};

export const deleteDepartment = async (id) => {
  try {
    const token = getAuthToken(); // Get the auth token
    const response = await api.delete(`/departments/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {  
    console.error('Department Delete Error:', error);
    
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to delete department');
    }

    throw error;
  }
};