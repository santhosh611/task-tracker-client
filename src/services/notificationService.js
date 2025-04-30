import api from '../hooks/useAxios';
import { getAuthToken } from '../utils/authUtils';

// Create a new notification
export const createNotification = async (notificationData) => {
  try {
    const token = getAuthToken();
    const response = await api.post('/notifications', notificationData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Create Notification Error:', error);
    throw error.response?.data || new Error('Failed to create notification');
  }
};

// Read notifications by subdomain (using query param)
export const readNotification = async (subdomain) => {
  try {
    const token = getAuthToken();
    const response = await api.get(`/notifications/${subdomain}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Read Notifications Error:', error);
    throw error.response?.data || new Error('Failed to fetch notifications');
  }
};

// Update a notification by ID
export const updateNotification = async (id, updateData) => {
  try {
    const token = getAuthToken();
    const response = await api.put(`/notifications/${id}`, updateData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Update Notification Error:', error);
    throw error.response?.data || new Error('Failed to update notification');
  }
};

// Delete a notification by ID
export const deleteNotification = async (id) => {
  try {
    const token = getAuthToken();
    const response = await api.delete(`/notifications/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Delete Notification Error:', error);
    throw error.response?.data || new Error('Failed to delete notification');
  }
};
