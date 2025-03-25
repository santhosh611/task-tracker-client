import api from '../hooks/useAxios';
import { getAuthToken } from '../utils/authUtils';
// Get all topics
export const getTopics = async () => {
  try {
    const token = getAuthToken();
    const response = await api.get('/topics', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Topics Fetch Error:', error);
    return [];
  }
};
// Create new topic
export const createTopic = async (topicData) => {
  try {
    const token = getAuthToken();
    const response = await api.post('/topics', topicData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to create topic');
  }
};

// Update topic
export const updateTopic = async (id, topicData) => {
  try {
    const token = getAuthToken();
    const response = await api.put(`/topics/${id}`, topicData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to update topic');
  }
};

// Delete topic
export const deleteTopic = async (id) => {
  try {
    const token = getAuthToken();
    const response = await api.delete(`/topics/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to delete topic');
  }
};