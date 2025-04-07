// client/src/services/foodRequestService.js
import api from './api';

export const submitFoodRequest = async () => {
  try {
    const response = await api.post('/food-requests');
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Failed to submit food request');
  }
};

export const getTodayRequests = async () => {
  try {
    const response = await api.get('/food-requests');
    console.log('API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error.response?.data || new Error('Failed to fetch food requests');
  }
};

export const toggleFoodRequests = async () => {
  try {
    const response = await api.put('/food-requests/toggle');
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Failed to toggle food requests');
  }
};

export const getFoodRequestSettings = async () => {
  try {
    const response = await api.get('/food-requests/settings');
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Failed to fetch settings');
  }
};