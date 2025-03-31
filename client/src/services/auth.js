import axios from 'axios';

// Get the base URL from environment variables
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

console.log('Environment:', process.env.NODE_ENV);
console.log('Using API URL:', API_URL);

// Function to validate the server is running
const validateServer = async () => {
    try {
        // Try the health endpoint first since it's more reliable
        console.log('Trying health check at:', `${API_URL}/health`);
        const healthResponse = await axios.get(`${API_URL}/health`, {
            timeout: 8000,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            withCredentials: true
        });

        if (healthResponse.data && healthResponse.data.status === 'healthy') {
            console.log('Health check successful:', healthResponse.data);
            return true;
        }

        // If health check doesn't confirm status, try root endpoint
        console.log('Health check inconclusive, trying root endpoint...');
        const rootResponse = await axios.get(BASE_URL, {
            timeout: 8000,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            withCredentials: true
        });

        if (!rootResponse.data || !rootResponse.data.status) {
            throw new Error('Invalid server response');
        }

        return true;
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

// Create axios instance with default config
const authApi = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: true,
    timeout: 60000, // Increase timeout to 60 seconds
    validateStatus: status => {
        return (status >= 200 && status < 300) || status === 304;
    }
});

let isServerValidated = false;

// Add request interceptor for debugging
authApi.interceptors.request.use(request => {
    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();
    if (request.method === 'get') {
        request.params = {
            ...request.params,
            _t: timestamp
        };
    }

    console.log('Starting Request:', {
        url: request.url,
        method: request.method,
        baseURL: request.baseURL,
        headers: request.headers,
        withCredentials: request.withCredentials,
        params: request.params
    });
    return request;
});

// Add response interceptor for debugging and error handling
authApi.interceptors.response.use(
    response => {
        console.log('Response:', {
            status: response.status,
            data: response.data,
            headers: response.headers,
            cookies: document.cookie
        });
        return response;
    },
    error => {
        console.error('API Error:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
            cookies: document.cookie
        });

        // Handle specific error cases
        if (error.code === 'ECONNABORTED') {
            throw new Error('Request timed out. The server might be starting up, please try again in a few moments.');
        }

        if (error.response?.status === 401) {
            throw new Error('Invalid email or password');
        }

        if (error.response?.status === 403) {
            throw new Error('Access denied. Please check your permissions.');
        }

        throw new Error(error.response?.data?.message || 'An unexpected error occurred. Please try again.');
    }
);

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

export const register = async (userData) => {
    try {
        console.log('Attempting registration with:', userData);
        const response = await authApi.post('/register', userData);
        return response.data;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
};

export const login = async (email, password, isStudent) => {
    try {
        console.log('Attempting login with:', { email, isStudent });
        const response = await authApi.post('/login', {
            email,
            password,
            is_student: isStudent
        });
        return response.data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

export const logout = async () => {
    try {
        await authApi.post('/logout');
        return true;
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
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