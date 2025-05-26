import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Request interceptor for API calls
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
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle specific error cases
    if (error.response) {
      // Log useful debugging information
      console.error('API Error:', {
        status: error.response.status,
        url: originalRequest.url,
        method: originalRequest.method,
        data: error.response.data
      });

      // Handle 401 Unauthorized errors
      if (error.response.status === 401) {
        if (typeof window !== 'undefined') {
          // Clear auth state and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          localStorage.removeItem('userRole');
          window.location.href = '/login';
        }
      }

      // Handle 403 Forbidden errors
      if (error.response.status === 403) {
        console.error('Access forbidden:', originalRequest.url);
      }

      // Handle 404 Not Found errors
      if (error.response.status === 404) {
        console.error('Resource not found:', originalRequest.url);
      }
    }

    return Promise.reject(error);
  }
);

export default api;