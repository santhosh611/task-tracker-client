import api from '../hooks/useAxios';
import { getAuthToken } from '../utils/authUtils';
// Get all columns

export const getColumns = async (columnData) => {
  try {
    if (!columnData.subdomain || columnData.subdomain == 'main') {
      throw new Error('Subdomain is missing check the URL');
    }
    const token = getAuthToken();
    const response = await api.get(`/columns/${columnData.subdomain}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Columns Fetch Error:', error);
    return [];
  }
};

// Create new column
export const createColumn = async (columnData) => {
  try {
    const token = getAuthToken(); // Add this line to get the token
    const response = await api.post('/columns', columnData, {
      headers: { Authorization: `Bearer ${token}` } // Add authorization header
    });
    return response.data;
  } catch (error) {
    console.error('Column Creation Error:', error);
    throw error.response ? error.response.data : new Error('Failed to create column');
  }
};
// Update column
export const updateColumn = async (id, columnData) => {
  try {
    const token = getAuthToken(); // Get the authentication token
    const response = await api.put(`/columns/${id}`, columnData, {
      headers: { Authorization: `Bearer ${token}` } // Add authorization header
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to update column');
  }
};

// Delete column
export const deleteColumn = async (id) => {
  try {
    const token = getAuthToken(); // Get the authentication token
    const response = await api.delete(`/columns/${id}`, {
      headers: { Authorization: `Bearer ${token}` } // Add authorization header
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to delete column');
  }
};