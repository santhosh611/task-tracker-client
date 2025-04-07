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

export const getTodayRequests = async (FoodRequestData) => {
  if (!FoodRequestData.subdomain || FoodRequestData.subdomain == 'main') {
    throw new Error ('Subdomain was missing check the URL.');
  }
  
  try {
    const response = await api.get(`/food-requests/${FoodRequestData.subdomain}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Failed to fetch food requests');
  }
};

export const toggleFoodRequests = async (FoodRequestData) => {
  if (!FoodRequestData.subdomain || FoodRequestData.subdomain == 'main') {
    throw new Error ('Subdomain was missing check the URL.');
  }

  try {
    const response = await api.put(`/food-requests/toggle/${FoodRequestData.subdomain}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Failed to toggle food requests');
  }
};

export const getFoodRequestSettings = async (FoodRequestData) => {
  if (!FoodRequestData.subdomain || FoodRequestData.subdomain == 'main') {
    throw new Error ('Subdomain was missing check the URL.');
  }

  try {
    const response = await api.get(`/food-requests/settings/${FoodRequestData.subdomain}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Failed to fetch settings');
  }
};