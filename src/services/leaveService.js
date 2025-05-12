import api from '../hooks/useAxios';
import { getAuthToken } from '../utils/authUtils';

export const getAllLeaves = async (leaveData) => {
  try {
    if (!leaveData.subdomain || leaveData.subdomain == 'main') {
      throw new Error('Subdomain is missing check the URL');
    }

    const token = getAuthToken();
    const response = await api.get(`/leaves/${leaveData.subdomain}/0`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to fetch leaves');
  }
};

export const getMyLeaves = async (leaveData) => {
  try {
    const token = getAuthToken(); // Add this line to get the token
    const response = await api.get(`/leaves/${leaveData.subdomain}/1`, {
      headers: { Authorization: `Bearer ${token}` } // Add authorization header
    });
    console.log('Leaves Service Response:', response.data);


    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Leaves Fetch Error:', error);
    throw error.response ? error.response.data : new Error('Failed to fetch leaves');
  }
}

// Create leave
export const createLeave = async (leaveData) => {
  try {
    const token = getAuthToken();

    // Validation
    if (!leaveData.subdomain || leaveData.subdomain == 'main') {
      throw new Error('Subdomain is missing check the URL');
    }
    if (!leaveData.reason || leaveData.reason.trim() === '') {
      throw new Error('Reason is required and cannot be empty');
    }
    if (!leaveData.startDate) {
      throw new Error('Start date is required');
    }
    if (!leaveData.endDate) {
      throw new Error('End date is required');
    }
    if (!leaveData.leaveType) {
      throw new Error('Leave type is required');
    }

    const formData = new FormData();
    Object.keys(leaveData).forEach(key => {
      if (key === 'document' && leaveData.document) {
        formData.append('document', leaveData.document, leaveData.document.name);
      } else {
        formData.append(key, leaveData[key]);
      }
    });

    const response = await api.post('/leaves', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Leave creation error:', error.response?.data || error);
    throw error.response?.data || new Error('Failed to create leave');
  }
};

// Update leave status (admin)
export const updateLeaveStatus = async (leaveId, status, leaveData) => {
  try {
    const token = getAuthToken();
    const response = await api.put(`/leaves/${leaveId}/status`, { status, leaveData }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to update leave status');
  }
};

// Mark leave as viewed (worker)
export const markLeaveAsViewed = async (leaveId) => {
  try {
    const token = getAuthToken();
    const response = await api.put(`/leaves/${leaveId}/viewed`, null, {
      headers: { Authorization: `Bearer ${token}` }
    });
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
    const token = getAuthToken();
    const response = await api.get(`/leaves/status?status=${status}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to fetch leaves');
  }
};

export const markLeavesAsViewedByAdmin = async () => {
  try {
    const token = getAuthToken();
    await api.put('/leaves/mark-viewed-by-admin', null, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (error) {
    console.error('Failed to mark leaves as viewed:', error);
  }
};