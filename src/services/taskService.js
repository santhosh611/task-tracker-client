import api from '../hooks/useAxios';
import { getAuthToken } from '../utils/authUtils';
// Create new task
export const createTask = async (taskData) => {
  console.log(taskData);
  try {
    const token = localStorage.getItem('token');
    const response = await api.post('/tasks', taskData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to create task');
  }
};

// Get all tasks (admin)
export const getAllTasks = async (subdomain) => {
  try {
    const token = getAuthToken();
    const response = await api.post('/tasks/all', subdomain, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Tasks API Response:', response.data);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Tasks Fetch Error:', error);
    throw error.response ? error.response.data : new Error('Failed to fetch tasks');
  }
};

// Get my tasks (worker)
export const getMyTasks = async () => {
  try {
    const token = getAuthToken();
    const response = await api.get('/tasks/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to fetch tasks');
  }
};

// Get tasks by date range (admin)
export const getTasksByDateRange = async (startDate, endDate) => {
  try {
    const response = await api.get(`/tasks/range?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to fetch tasks');
  }
};

// Reset all tasks (admin)
export const resetAllTasks = async (taskData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.delete(`/tasks/reset/${taskData.subdomain}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to reset tasks');
  }
};


export const submitCustomTask = async (customTaskData) => {
  try {
    const token = getAuthToken();
    const response = await api.post('/tasks/custom', customTaskData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to submit custom task');
  }
};

export const getCustomTask = async (taskData) => {
  try {
    const token = getAuthToken();
    const response = await api.get(`/tasks/custom/${taskData.subdomain}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Could not fetch custom task');
  }
}

export const approveCustomTask = async (taskId, points = 1) => {
  try {
    const token = getAuthToken();
    const response = await api.put(`/tasks/${taskId}/approve`,
      { points },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to approve task');
  }
};