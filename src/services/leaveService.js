import api from '../services/api';
import { getAuthToken } from '../utils/authUtils';
export const getAllLeaves = async () => {
  try {
    const response = await api.get('/leaves');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to fetch leaves');
  }
};

export const getMyLeaves = async () => {
  try {
    const response = await api.get('/leaves/me');
    console.log('Leaves Service Response:', response.data);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Leaves Fetch Error:', error);
    throw error.response ? error.response.data : new Error('Failed to fetch leaves');
  }
};

// Create leave
export const createLeave = async (leaveData) => {
  try {
    const response = await api.post('/leaves', leaveData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to create leave');
  }
};
// Update leave status (admin)
export const updateLeaveStatus = async (leaveId, status) => {
  try {
    const response = await api.put(`/leaves/${leaveId}/status`, { status });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to update leave status');
  }
};

// Mark leave as viewed (worker)
export const markLeaveAsViewed = async (leaveId) => {
  try {
    const response = await api.put(`/leaves/${leaveId}/viewed`, null);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to mark leave as viewed');
  }
};

// Get leaves by date range (admin)
export const getLeavesByDateRange = async (startDate, endDate) => {
  try {
    const response = await api.get(`/leaves/range?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to fetch leaves');
  }
};

export const getLeavesByStatus = async (status) => {
  try {
    const response = await api.get(`/leaves/status?status=${status}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to fetch leaves');
  }
};

export const markLeavesAsViewedByAdmin = async () => {
  try {
    await api.put('/leaves/mark-viewed-by-admin', null);
  } catch (error) {
    console.error('Failed to mark leaves as viewed:', error);
  }
};

export const getNewLeaveRequestsCount = async () => {
  try {
    const response = await api.get('/leaves/new-requests-count');
    return response.data.count;
  } catch (error) {
    console.error('Failed to fetch new leave requests count:', error);
    return 0;
  }
};