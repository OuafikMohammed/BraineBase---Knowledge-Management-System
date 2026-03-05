import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Improved request interceptor
api.interceptors.request.use(
  (config) => {
    // Only try to access localStorage in browser environment
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Enhanced error handling in response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Log the error for debugging
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method
      }
    });

    // Handle unauthorized access
    if (error.response?.status === 401) {
      // Clear auth state on unauthorized
      if (typeof window !== 'undefined') {
        localStorage.clear();
        // Only redirect to login if not already on login page
          window.location.href = '/';
      }
    }

    return Promise.reject(error);
  }
);

export default api;