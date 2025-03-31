import axios from 'axios';

// Get the base URL from environment variables
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

console.log('API Configuration:', {
    BASE_URL,
    API_URL,
    NODE_ENV: process.env.NODE_ENV,
    origin: window.location.origin
});

// Create axios instance with default config
const authApi = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: true,
    timeout: 30000 // 30 seconds
});

// Function to validate the server is running
const validateServer = async () => {
    try {
        // Try the health endpoint first
        console.log('Checking server health at:', `${API_URL}/health`);
        const healthResponse = await axios.get(`${API_URL}/health`, {
            timeout: 10000,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            withCredentials: true
        });

        console.log('Health check response:', healthResponse.data);

        if (healthResponse.data && healthResponse.data.status === 'healthy') {
            return true;
        }

        throw new Error('Server health check failed');
    } catch (error) {
        console.error('Server validation failed:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            response: error.response?.data,
            status: error.response?.status
        });

        if (error.code === 'ECONNABORTED') {
            throw new Error('Server is starting up. Please try again in a few moments.');
        } else if (error.response?.status === 404) {
            throw new Error('Server endpoints not found. Please check the server configuration.');
        } else if (error.code === 'ERR_NETWORK') {
            throw new Error('Network error. Please check your connection and ensure the server is running.');
        }
        throw new Error(`Server validation failed: ${error.message}`);
    }
};

let isServerValidated = false;

// Add request interceptor for error handling
authApi.interceptors.request.use(
    async config => {
        // Skip validation for health endpoint
        if (config.url === '/health') {
            return config;
        }

        // Validate server only once
        if (!isServerValidated) {
            try {
                await validateServer();
                isServerValidated = true;
            } catch (error) {
                console.error('Server validation failed in interceptor:', error);
                throw error;
            }
        }

        return config;
    },
    error => Promise.reject(error)
);

// Add response interceptor to handle errors
authApi.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', error);
        console.error('Full error details:', {
            status: error.response?.status,
            data: error.response?.data,
            headers: error.response?.headers,
            config: error.config
        });

        if (error.code === 'ECONNABORTED') {
            throw new Error('Request timed out. The server might be starting up, please try again in a few moments.');
        } else if (error.response?.status === 404) {
            throw new Error(`API endpoint not found: ${error.config?.url}`);
        } else if (error.code === 'ERR_NETWORK') {
            throw new Error('Network error. Please check your connection and try again.');
        } else if (error.response?.status === 401) {
            localStorage.removeItem('user');
            throw new Error(error.response.data?.error || 'Authentication failed');
        } else if (error.response?.data?.error) {
            throw new Error(error.response.data.error);
        }
        throw error;
    }
);

// Registration function
export const register = async (userData) => {
    try {
        console.log('Registering user:', userData);  // Debug log
        console.log('Using API URL:', API_URL);  // Debug log

        const response = await authApi.post('/register', userData);
        console.log('Registration response:', response.data);  // Debug log

        if (response.data.status === 'success') {
            return {
                success: true,
                data: response.data.user,
                message: response.data.message
            };
        } else {
            throw new Error(response.data.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        console.error('Full error details:', {
            status: error.response?.status,
            data: error.response?.data,
            headers: error.response?.headers,
            config: error.config
        });

        throw new Error(
            error.response?.data?.message ||
            error.message ||
            'Registration failed. Please try again.'
        );
    }
};

export const login = async (credentials) => {
    try {
        console.log('Login attempt with:', credentials);
        console.log('Using API URL:', API_URL);
        const response = await authApi.post('/login', credentials);
        console.log('Login response:', response.data);

        if (response.data.success) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
            return response.data.user;
        } else {
            throw new Error(response.data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

export const logout = async () => {
    try {
        const response = await authApi.post('/logout');
        localStorage.removeItem('user');
        return true;
    } catch (error) {
        console.error('Logout error:', error);
        throw new Error(error.response?.data?.error || error.message || 'Logout failed');
    }
};

export const checkSession = async () => {
    try {
        console.log('Checking session...');
        const response = await authApi.get('/check-session');
        console.log('Session check response:', response.data);

        if (response.data.logged_in && response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
            return response.data.user;
        }

        localStorage.removeItem('user');
        return null;
    } catch (error) {
        console.error('Session check error:', error);
        localStorage.removeItem('user');
        if (error.response?.data?.error) {
            throw new Error(error.response.data.error);
        } else if (error.message) {
            throw new Error(error.message);
        } else {
            throw new Error('Session check failed. Please try again.');
        }
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