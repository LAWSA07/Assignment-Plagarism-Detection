import axios from 'axios';

// Use the deployed API URL consistently
const BASE_URL = 'https://assignment-plagarism-detection-1.onrender.com';

// Construct the API URL
const API_URL = `${BASE_URL}/api`;

console.log('Using API URL:', API_URL);

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Add request interceptor for debugging
api.interceptors.request.use(
    (config) => {
        console.log('Making request to:', config.url);
        console.log('Request headers:', config.headers);
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for debugging
api.interceptors.response.use(
    (response) => {
        console.log('Response received:', response.status, response.data);
        return response;
    },
    (error) => {
        console.error('Response error:', error.response?.status, error.response?.data);
        return Promise.reject(error);
    }
);

export const verifySession = async () => {
    try {
        console.log('Verifying session...');
        const response = await api.get('/check-session');
        console.log('Session check response:', response.data);

        if (!response.data.logged_in) {
            throw new Error('Not logged in');
        }

        // Store user data in localStorage
        if (response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }

        return response.data;
    } catch (error) {
        console.error('Session verification error:', error);
        localStorage.removeItem('user'); // Clear user data on error
        throw new Error('Session verification failed');
    }
};

export const fetchStudentAssignments = async () => {
    try {
        const response = await api.get('/student/assignments');
        return response.data;
    } catch (error) {
        console.error('Error fetching assignments:', error);
        throw new Error('Failed to fetch assignments');
    }
};

export const downloadAssignment = async (assignmentId) => {
    try {
        const response = await api.get(`/assignments/${assignmentId}/download`, {
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
        const response = await api.post(`/assignments/submit/${assignmentId}`, formData, {
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
        const response = await api.get(`/submissions/${submissionId}/status`);
        return response.data;
    } catch (error) {
        console.error('Error checking submission status:', error);
        throw new Error('Failed to check submission status');
    }
};

export const logout = async () => {
    try {
        await api.post('/logout');
        return true;
    } catch (error) {
        console.error('Logout error:', error);
        throw new Error('Failed to logout');
    }
};