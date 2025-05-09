import axios from 'axios';

// Environment-aware API URL configuration
// Handles both development and production environments
const getApiBaseUrl = () => {
  // Use environment variable if available
  const envUrl = process.env.REACT_APP_API_URL;
  if (envUrl) {
    return envUrl;
  }

  // Fallback for development - based on current hostname
  const isLocalhost = window.location.hostname === 'localhost' ||
                     window.location.hostname === '127.0.0.1';

  return isLocalhost ? 'http://localhost:5000/api' : '';
};

const API_URL = getApiBaseUrl();
console.log('Using API URL:', API_URL);

// Get the base domain without /api
const getBaseDomain = () => {
  if (!API_URL) return '';

  const apiIndex = API_URL.indexOf('/api');
  return apiIndex > 0 ? API_URL.substring(0, apiIndex) : API_URL;
};

// Create axios instance with default config
const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true,
  timeout: 15000 // 15 second timeout for slow production environments
});

// Add request interceptor for error handling
authApi.interceptors.request.use(
  async config => {
    // Skip health check for health endpoint to avoid infinite loop
    if (config.url === '/health' || config.url === 'health') {
      return config;
    }

    try {
      // Always use base domain health endpoint without /api
      const baseUrl = getBaseDomain();
      const healthUrl = `${baseUrl}/health`;

      console.log('Health check URL:', healthUrl);

      await axios.get(healthUrl, {
        timeout: 5000,
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
    const response = await authApi.post('/auth/register', userData);
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

    // Ensure we're using the correct endpoint with /api prefix
    // For local development, API_URL already includes /api
    const baseUrl = getBaseDomain();

    // Determine whether to use /api prefix based on environment
    const useApiPrefix = !baseUrl.includes('/api') && !API_URL.includes('/api');
    const loginEndpoint = useApiPrefix
      ? '/api/auth/login'
      : '/auth/login';

    // Construct complete login URL
    const loginUrl = `${baseUrl}${loginEndpoint}`;

    console.log('Login URL:', loginUrl);

    // Use fetch directly instead of axios
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(credentials)
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      } catch (e) {
        throw new Error(`Login failed: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();
    console.log('Login response:', data);

    if (data.success) {
      localStorage.setItem('user', JSON.stringify(data.user));
      return data.user;
    } else {
      throw new Error(data.message || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw new Error(error.message || 'Login failed. Please try again.');
  }
};

export const logout = async () => {
  try {
    console.log('Logging out user');

    // Use the same URL construction logic as the login function
    const baseUrl = getBaseDomain();

    // Try to logout with the API URL directly first
    let logoutSuccess = false;
    let errors = [];

    // Attempt multiple URL patterns to maximize chances of successful logout
    // Pattern 1: /api/auth/logout - matches how routes are registered in Flask
    const logoutUrl1 = `${baseUrl}/api/auth/logout`;
    console.log('Trying logout URL 1:', logoutUrl1);

    try {
      const response1 = await fetch(logoutUrl1, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (response1.ok) {
        logoutSuccess = true;
        console.log('Logout successful on server using URL pattern 1');
      } else {
        errors.push(`Pattern 1 failed: ${response1.status}`);
      }
    } catch (e) {
      errors.push(`Pattern 1 error: ${e.message}`);
    }

    // Pattern 2: /auth/logout - direct access route in main app.py
    if (!logoutSuccess) {
      const logoutUrl2 = `${baseUrl}/auth/logout`;
      console.log('Trying logout URL 2:', logoutUrl2);

      try {
        const response2 = await fetch(logoutUrl2, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });

        if (response2.ok) {
          logoutSuccess = true;
          console.log('Logout successful on server using URL pattern 2');
        } else {
          errors.push(`Pattern 2 failed: ${response2.status}`);
        }
      } catch (e) {
        errors.push(`Pattern 2 error: ${e.message}`);
      }
    }

    // Pattern 3: /api/logout - fallback route in main app.py
    if (!logoutSuccess) {
      const logoutUrl3 = `${baseUrl}/api/logout`;
      console.log('Trying logout URL 3:', logoutUrl3);

      try {
        const response3 = await fetch(logoutUrl3, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });

        if (response3.ok) {
          logoutSuccess = true;
          console.log('Logout successful on server using URL pattern 3');
        } else {
          errors.push(`Pattern 3 failed: ${response3.status}`);
        }
      } catch (e) {
        errors.push(`Pattern 3 error: ${e.message}`);
      }
    }

    // Always clear local storage regardless of server response
    localStorage.removeItem('user');

    if (!logoutSuccess) {
      console.warn('Server logout failed with all patterns:', errors);
      console.warn('But proceeding with local logout anyway');
    }

    // Always return success since we've cleared local storage
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    // Always remove user data locally even if server request fails
    localStorage.removeItem('user');
    return true; // Return success anyway since we've logged out locally
  }
};

export const checkSession = async () => {
  try {
    console.log('Checking session...');
    const response = await authApi.get('/auth/check-session');
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