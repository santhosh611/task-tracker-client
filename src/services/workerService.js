import api from '../hooks/useAxios';
import { getAuthToken } from '../utils/authUtils';

export const createWorker = async (workerData) => {
  try {
    console.log('Worker data:', workerData);
    const token = getAuthToken();
    
    // Enhanced client-side validation
    if (!workerData.name || workerData.name.trim() === '') {
      throw new Error('Name is required and cannot be empty');
    }
    if (!workerData.username || workerData.username.trim() === '') {
      throw new Error('Username is required and cannot be empty');
    }
    if (!workerData.subdomain || workerData.subdomain.trim() === '') {
      throw new Error('Subdomain is missing, please check the url');
    }
    if (!workerData.password || workerData.password.trim() === '') {
      throw new Error('Password is required and cannot be empty');
    }
    if (!workerData.department) {
      throw new Error('Department is required');
    }

    const formData = new FormData();
    Object.keys(workerData).forEach(key => {
      if (key === 'photo' && workerData.photo) {
        formData.append('photo', workerData.photo, workerData.photo.name);
      } else {
        formData.append(key, workerData[key]);
      }
    });

    const response = await api.post('/workers', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Worker creation error:', error.response?.data || error);
    throw error.response?.data || new Error('Failed to create worker');
  }
};
export const getWorkers = async (subdomain) => {
  try {
    const token = getAuthToken();
    if (!token) {
      console.warn('No auth token available');
      return [];
    }
    
    const response = await api.post('/workers/all', subdomain, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      }
    });
    return response.data || [];
  } catch (error) {
    console.error('Workers fetch error:', error);
    return [];
  }
};
export const getPublicWorkers = async (subdomain) => {
  try {
    const token = getAuthToken();
    const response = await api.post('/workers/public', subdomain, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data || [];
  } catch (error) {
    console.error('Public workers fetch error:', error);
    return [];
  }
};

export const updateWorker = async (id, workerData) => {
  try {
    const token = getAuthToken();
    const formData = new FormData();
    
    // Append all data to formData
    Object.keys(workerData).forEach(key => {
      if (key === 'photo' && workerData.photo instanceof File) {
        formData.append('photo', workerData.photo, workerData.photo.name);
      } else if (workerData[key] !== undefined) {
        formData.append(key, workerData[key]);
      }
    });

    const response = await api.put(`/workers/${id}`, formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Update Worker Error:', {
      response: error.response,
      data: error.response?.data,
      status: error.response?.status
    });
    throw error.response ? error.response.data : new Error('Failed to update worker');
  }
};
export const deleteWorker = async (id) => {
  try {
    const token = getAuthToken(); // Get the authentication token
    const response = await api.delete(`/workers/${id}`, {
      headers: { Authorization: `Bearer ${token}` } // Add authorization header
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to delete worker');
  }
};