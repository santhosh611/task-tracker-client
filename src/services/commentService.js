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
    console.error('Failed to fetch my comments:', error);
    throw error.response ? error.response.data : new Error('Failed to fetch comments');
  }
};

// Get worker comments (admin)
export const getWorkerComments = async (workerId) => {
  try {
    const token = getAuthToken();
    const response = await api.get(`/comments/worker/${workerId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch worker comments for ${workerId}:`, error);
    throw error.response ? error.response.data : new Error('Failed to fetch comments');
  }
};

// Create comment
export const createComment = async (commentData) => {
  try {
    const token = localStorage.getItem('token');
    
    console.log('Creating comment with token:', token ? 'Token exists' : 'No token');
    console.log('Comment data:', commentData);
    
    const response = await api.post('/comments', commentData, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Comment created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to create comment:', error);
    const errorMessage = error.response?.data?.message || 'Failed to create comment';
    throw new Error(errorMessage);
  }
};

// Add reply to comment
export const addReply = async (commentId, replyData) => {
  try {
    const token = localStorage.getItem('token');
    console.log(`Adding reply to comment ${commentId}:`, replyData);
    
    const response = await api.post(`/comments/${commentId}/replies`, replyData, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      }
    });
    
    console.log('Reply added successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Failed to add reply to comment ${commentId}:`, error);
    throw error.response ? error.response.data : new Error('Failed to add reply');
  }
};

// Mark comment as read
export const markCommentAsRead = async (commentId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.put(`/comments/${commentId}/read`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to mark comment ${commentId} as read:`, error);
    throw error.response ? error.response.data : new Error('Failed to mark comment as read');
  }
};

// Get unread admin replies
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

// Mark admin replies as read
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

// Cleanup comments (admin only)
export const cleanupComments = async () => {
  try {
    const token = getAuthToken();
    const response = await api.post('/comments/cleanup', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to cleanup comments:', error);
    throw error.response ? error.response.data : new Error('Failed to cleanup comments');
  }
};

export default {
  getAllComments,
  getMyComments,
  getWorkerComments,
  createComment,
  addReply,
  markCommentAsRead,
  getUnreadAdminReplies,
  markAdminRepliesAsRead,
  cleanupComments
};