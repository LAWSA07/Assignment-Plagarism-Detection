import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const authApi = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true,
    timeout: 10000 // 10 second timeout
});

// Add request interceptor for error handling
authApi.interceptors.request.use(
    async config => {
        // Skip health check for health endpoint to avoid infinite loop
        if (config.url === '/health') {
            return config;
        }
        
        try {
            // Try to connect to server
            await axios.get(`${API_URL}/health`, { 
                timeout: 3000,
                withCredentials: true
            });
            return config;
        } catch (error) {
            console.error('Server health check failed:', error);
            if (error.code === 'ERR_NETWORK') {
                throw new Error('Unable to connect to server. Please make sure the server is running.');
            } else if (error.code === 'ECONNABORTED') {
                throw new Error('Server connection timed out. Please try again.');
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
        if (error.response?.data?.error) {
            throw new Error(error.response.data.error);
        } else if (error.message) {
            throw new Error(error.message);
        } else {
            throw new Error('Registration failed. Please try again.');
        }
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
        if (error.response?.data?.error) {
            throw new Error(error.response.data.error);
        } else if (error.message) {
            throw new Error(error.message);
        } else {
            throw new Error('Login failed. Please try again.');
        }
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