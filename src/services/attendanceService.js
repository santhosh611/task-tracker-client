import api from '../hooks/useAxios';
import { getAuthToken } from '../utils/authUtils';

export const putAttendance = async (attendanceData) => {
    const token = getAuthToken();

    console.log(attendanceData);

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

export default {
    putAttendance
};