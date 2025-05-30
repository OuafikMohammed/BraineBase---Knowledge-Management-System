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
      // Add CSRF token if needed
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      if (csrfToken) {
        config.headers['X-CSRF-TOKEN'] = csrfToken;
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
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method
      }
    });

    if (error.response?.status === 401) {
      // Clear auth state on unauthorized
      if (typeof window !== 'undefined') {
        localStorage.clear();
        window.location.href = '/';
      }
    }

    return Promise.reject(error);
  }
);

export default api;