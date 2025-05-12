import api from '../hooks/useAxios';
import { getAuthToken } from '../utils/authUtils';

export const giveBonusAmount = async (salaryData) => {
  try {
    const token = getAuthToken();
    const response = await api.post(`/salary/give-bonus/${salaryData.id}`, {amount: salaryData.amount}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to update leave status');
  }
};

export const resetSalaryAmount = async (salaryData) => {
  try {
    const token = getAuthToken();
    const response = await api.post(`/salary/reset-salary`, {subdomain: salaryData.subdomain}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to update leave status');
  }
};