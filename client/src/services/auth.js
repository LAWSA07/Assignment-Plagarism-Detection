import axios from 'axios';

// Get the API URL from environment variables
const API_URL = process.env.REACT_APP_API_URL || 'https://assignment-plagarism-detection.onrender.com/api';

console.log('Using API URL:', API_URL);

// Create axios instance with default config
export const api = axios.create({
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
        console.log('Making request to:', `${config.baseURL}${config.url}`);
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
        console.error('Response error:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        return Promise.reject(error);
    }
);

// Function to validate the server is running
const validateServer = async () => {
    try {
        console.log('Trying health check at:', `${API_URL}/health`);
        const response = await api.get('/health');
        console.log('Health check response:', response.data);
        return true;
    } catch (error) {
        console.error('Server validation failed:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
        throw new Error('Failed to connect to server. Please try again later.');
    }
};

let isServerValidated = false;

// Add request interceptor for server validation
api.interceptors.request.use(
    async config => {
        // Skip validation for health endpoint to avoid infinite loop
        if (config.url === '/health') {
            return config;
        }

        if (!isServerValidated) {
            try {
                await validateServer();
                isServerValidated = true;
            } catch (error) {
                console.error('Server validation failed in interceptor:', error);
                return Promise.reject(error);
            }
        }

        return config;
    },
    error => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

export const login = async (email, password, isStudent) => {
    try {
        console.log('Attempting login with:', { email, isStudent });
        const response = await api.post('/auth/login', { email, password, isStudent });
        console.log('Login response:', response.data);

        if (response.data.success) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
            return response.data;
        } else {
            throw new Error(response.data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
        throw new Error(error.response?.data?.message || error.message || 'Login failed');
    }
};

export const register = async (userData) => {
    try {
        console.log('Attempting registration with:', userData);
        const response = await api.post('/register', userData);
        console.log('Registration response:', response.data);

        if (response.data.success) {
            // Store user data in localStorage
            localStorage.setItem('user', JSON.stringify(response.data.user));
            return response.data;
        } else {
            throw new Error(response.data.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        throw new Error(error.response?.data?.message || 'Registration failed');
    }
};

export const logout = async () => {
    try {
        console.log('Attempting logout');
        const response = await api.post('/logout');
        console.log('Logout response:', response.data);

        // Clear user data from localStorage
        localStorage.removeItem('user');
        return response.data;
    } catch (error) {
        console.error('Logout error:', error);
        throw new Error(error.response?.data?.message || 'Logout failed');
    }
};

export const checkSession = async () => {
    try {
        console.log('Checking session...');
        const response = await api.get('/check-session');
        console.log('Session check response:', response.data);

        if (response.data.logged_in && response.data.user) {
            // Store user data in localStorage
            localStorage.setItem('user', JSON.stringify(response.data.user));
            return response.data;
        }

        // Clear user data if not logged in
        localStorage.removeItem('user');
        return response.data;
    } catch (error) {
        console.error('Session check error:', error);
        // Clear user data on error
        localStorage.removeItem('user');
        throw new Error(error.response?.data?.message || 'Session check failed');
    }
};

export const getCurrentUser = () => {
    try {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
        console.error('Error getting current user:', error);
        localStorage.removeItem('user');
        return null;
    }
};

export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};

export const getToken = () => {
    return localStorage.getItem('token');
};

// Professor-specific functions
export const fetchProfessorAssignments = async () => {
    try {
        const response = await api.get('/professor/assignments');
        return response.data;
    } catch (error) {
        console.error('Error fetching professor assignments:', error);
        throw error;
    }
};

// Student-specific functions
export const fetchStudentAssignments = async () => {
    try {
        const response = await api.get('/student/assignments');
        return response.data;
    } catch (error) {
        console.error('Error fetching student assignments:', error);
        throw error;
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
        throw error;
    }
};