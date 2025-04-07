import api from '../services/api';
import { getAuthToken } from '../utils/authUtils';

// Get all comments (admin)
export const getAllComments = async () => {
  try {
    const response = await api.get('/comments');
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
    const response = await api.get('/comments/me');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch my comments:', error);
    throw error.response ? error.response.data : new Error('Failed to fetch comments');
  }
};

// Get worker comments (admin)
export const getWorkerComments = async (workerId) => {
  try {
    const response = await api.get(`/comments/worker/${workerId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch worker comments for ${workerId}:`, error);
    throw error.response ? error.response.data : new Error('Failed to fetch comments');
  }
};

// Create comment
export const createComment = async (commentData) => {
  try {
    console.log('Creating comment');
    console.log('Comment data:', commentData);
    
    const response = await api.post('/comments', commentData);

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
    console.log(`Adding reply to comment ${commentId}:`, replyData);
    
    const response = await api.post(`/comments/${commentId}/replies`, replyData);
    
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
    const response = await api.put(`/comments/${commentId}/read`, {});
    return response.data;
  } catch (error) {
    console.error(`Failed to mark comment ${commentId} as read:`, error);
    throw error.response ? error.response.data : new Error('Failed to mark comment as read');
  }
};


// Get unread admin replies
export const getUnreadAdminReplies = async () => {
  try {
    const response = await api.get('/comments/unread-admin-replies');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch unread admin replies:', error);
    return [];
  }
};

// Mark admin replies as read
export const markAdminRepliesAsRead = async () => {
  try {
    await api.put('/comments/mark-admin-replies-read', null);
  } catch (error) {
    console.error('Failed to mark admin replies as read:', error);
  }
};

// Cleanup comments (admin only)
export const cleanupComments = async () => {
  try {
    const response = await api.post('/comments/cleanup', {});
    return response.data;
  } catch (error) {
    console.error('Failed to cleanup comments:', error);
    throw error.response ? error.response.data : new Error('Failed to cleanup comments');
  }
};


export const getNewCommentCount = async () => {
  try {
    const response = await api.get('/comments/new-count');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch new comment count:', error);
    throw error.response?.data || new Error('Failed to fetch new comment count');
  }
};

export const markAllCommentsAsRead = async () => {
  try {
    await api.put('/comments/mark-all-read');
  } catch (error) {
    console.error('Failed to mark all comments as read:', error);
    throw error;
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
  cleanupComments,
  getNewCommentCount,
  markAllCommentsAsRead
};