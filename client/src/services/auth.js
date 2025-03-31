import axios from 'axios';

// Remove the /api suffix from the base URL as we'll add it in the routes
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

// Function to validate the server is running
const validateServer = async () => {
    try {
        // Try the root URL first
        const rootResponse = await axios.get(BASE_URL, { timeout: 5000 });
        console.log('Server root response:', rootResponse.data);
        return true;
    } catch (error) {
        console.error('Server validation failed:', error);
        if (error.code === 'ECONNABORTED') {
            throw new Error('Server is starting up. Please try again in a few moments.');
        } else if (error.response?.status === 404) {
            // If root returns 404, try the health endpoint
            try {
                const healthResponse = await axios.get(`${API_URL}/health`, { timeout: 5000 });
                console.log('Health check response:', healthResponse.data);
                return true;
            } catch (healthError) {
                throw new Error('Server is not responding correctly. Please try again later.');
            }
        }
        throw error;
    }
};

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

let isServerValidated = false;

// Add request interceptor for error handling
authApi.interceptors.request.use(
    async config => {
        // Add origin header
        config.headers['Origin'] = window.location.origin;

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

        // Handle specific error cases
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

export const register = async (userData) => {
    try {
        console.log('Registering user:', userData);
        console.log('Using API URL:', API_URL);
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