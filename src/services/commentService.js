import api from '../hooks/useAxios';
import { getAuthToken } from '../utils/authUtils';
// Get all comments (admin)
export const getAllComments = async () => {
  try {
    const token = getAuthToken();
    const response = await api.get('/comments', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Comments response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch comments:', error);
    throw error.response ? error.response.data : new Error('Failed to fetch comments');
  }
};
// Get my comments (worker)
export const getMyComments = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.get('/comments/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to fetch comments');
  }
};

// Get worker comments (admin)
export const getWorkerComments = async (workerId) => {
  try {
    const response = await api.get(`/comments/worker/${workerId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to fetch comments');
  }
};

// Create comment
export const createComment = async (commentData) => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await api.post('/comments', commentData, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to create comment');
  }
};

// Add reply to comment
export const addReply = async (commentId, replyData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.post(`/comments/${commentId}/replies`, replyData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to add reply');
  }
};

// Mark comment as read
export const markCommentAsRead = async (commentId) => {
  try {
    const response = await api.put(`/comments/${commentId}/read`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to mark comment as read');
  }
};

export const getUnreadAdminReplies = async () => {
  try {
    const token = getAuthToken();
    const response = await api.get('/comments/unread-admin-replies', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch unread admin replies:', error);
    return [];
  }
};

export const markAdminRepliesAsRead = async () => {
  try {
    const token = getAuthToken();
    await api.put('/comments/mark-admin-replies-read', null, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (error) {
    console.error('Failed to mark admin replies as read:', error);
  }
};