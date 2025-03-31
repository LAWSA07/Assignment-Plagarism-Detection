import axios from 'axios';

// Get the base URL from environment variables
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

// Create axios instance with default config
const dashboardApi = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: true,
    timeout: 30000 // 30 seconds
});

export const verifySession = async () => {
    try {
        console.log('Verifying session...');
        const response = await dashboardApi.get('/check-session');
        console.log('Session check response:', response.data);

        if (!response.data.logged_in) {
            throw new Error('Not logged in');
        }

        return response.data;
    } catch (error) {
        console.error('Session verification error:', error);
        throw new Error('Session verification failed');
    }
};

export const fetchStudentAssignments = async () => {
    try {
        const response = await dashboardApi.get('/student/assignments');
        return response.data;
    } catch (error) {
        console.error('Error fetching assignments:', error);
        throw new Error('Failed to fetch assignments');
    }
};

export const downloadAssignment = async (assignmentId) => {
    try {
        const response = await dashboardApi.get(`/assignments/${assignmentId}/download`, {
            responseType: 'blob'
        });
        return response.data;
    } catch (error) {
        console.error('Error downloading assignment:', error);
        throw new Error('Failed to download assignment');
    }
};

export const submitAssignment = async (assignmentId, formData) => {
    try {
        const response = await dashboardApi.post(`/assignments/submit/${assignmentId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error submitting assignment:', error);
        throw new Error('Failed to submit assignment');
    }
};

export const checkSubmissionStatus = async (submissionId) => {
    try {
        const response = await dashboardApi.get(`/submissions/${submissionId}/status`);
        return response.data;
    } catch (error) {
        console.error('Error checking submission status:', error);
        throw new Error('Failed to check submission status');
    }
};

export const logout = async () => {
    try {
        await dashboardApi.post('/logout');
        return true;
    } catch (error) {
        console.error('Logout error:', error);
        throw new Error('Failed to logout');
    }
};