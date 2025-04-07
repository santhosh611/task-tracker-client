import api from '../hooks/useAxios';
import { getAuthToken } from '../utils/authUtils';

export const putAttendance = async (attendanceData) => {
    const token = getAuthToken();

    try {
        const response = await api.put('/attendance', attendanceData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });
        return response.data;
    } catch (error) {
        console.error('Failed to update attendance:', error);
        throw error.response?.data || new Error('Failed to update attendance');
    }
};

export const getAttendance = async (attendanceData) => {
    const token = getAuthToken();

    try {
        const response = await api.post('/attendance', attendanceData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });
        return response.data;
    } catch (error) {
        console.error('Failed to update attendance:', error);
        throw error.response?.data || new Error('Failed to update attendance');
    }
};

export const getWorkerAttendance = async (attendanceData) => {
    const token = getAuthToken();

    try {
        const response = await api.post('/attendance/worker', attendanceData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });
        return response.data;
    } catch (error) {
        console.error('Failed to update attendance:', error);
        throw error.response?.data || new Error('Failed to update attendance');
    }
};

export default {
    putAttendance,
    getAttendance,
    getWorkerAttendance
};