import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const BASE_URL = API_URL.replace('/api', ''); // Get base URL without /api

// Create axios instance with default config
const authApi = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true,
    timeout: 30000 // 30 second timeout
});

// Add request interceptor for error handling
authApi.interceptors.request.use(
    async config => {
        // Skip health check for health endpoint to avoid infinite loop
        if (config.url === '/health') {
            return config;
        }

        try {
            // Try to connect to server using base health check
            const response = await axios.get(`${BASE_URL}/health`, {
                timeout: 5000,
                withCredentials: true
            });

            if (!response.data || response.data.status !== 'healthy') {
                throw new Error('Server health check failed');
            }

            return config;
        } catch (error) {
            console.error('Server health check failed:', error);
            // Try API health check as fallback
            try {
                const apiResponse = await axios.get(`${API_URL}/health`, {
                    timeout: 5000,
                    withCredentials: true
                });

                if (apiResponse.data && apiResponse.data.status === 'healthy') {
                    return config;
                }
            } catch (apiError) {
                console.error('API health check also failed:', apiError);
            }

            throw new Error('Server is not responding. Please try again later.');
        }
    },
    error => Promise.reject(error)
);

// Add response interceptor to handle errors
authApi.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', error);

        if (error.code === 'ERR_NETWORK') {
            throw new Error('Network error. Please check your connection and try again.');
        }

        if (error.response?.status === 401) {
            localStorage.removeItem('user');
        }

        if (error.response?.data?.error) {
            throw new Error(error.response.data.error);
        }

        throw error;
    }
);

export const register = async (userData) => {
    try {
        console.log('Registering user:', userData);
        const response = await authApi.post('/register', userData);
        console.log('Registration response:', response.data);

        if (response.data.success) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
            return response.data.user;
        } else {
            throw new Error(response.data.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
};

export const login = async (credentials) => {
    try {
        console.log('Login attempt with:', credentials);
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
        await authApi.post('/logout');
        localStorage.removeItem('user');
    } catch (error) {
        console.error('Logout error:', error);
        // Still remove user from localStorage even if server request fails
        localStorage.removeItem('user');
        throw error;
    }
};

export const checkSession = async () => {
    try {
        const response = await authApi.get('/check-session');
        return response.data;
    } catch (error) {
        console.error('Session check error:', error);
        return { logged_in: false, user: null };
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