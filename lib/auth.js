import axios from 'axios';
import api from './api';

// Authentication tokens are stored in localStorage
const TOKEN_KEY = 'auth_token';

export async function login(email, password) {
  try {
    const response = await api.post('/login', { email, password });
    if (typeof window !== "undefined") {
      if (response.data.token) {
        localStorage.setItem(TOKEN_KEY, response.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      if (response.data.user && response.data.user.id_profile) {
        localStorage.setItem('userId', response.data.user.id_profile);
      }
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { errors: { general: 'Authentication failed' } };
  }
}

export async function register(name, email, password, profileType) {
  try {
    const response = await api.post('/register', {
      name,
      email,
      password,
      profile_type: profileType,
    });
    if (response.data.token && typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, response.data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { errors: { general: 'Registration failed' } };
  }
}

export async function getProfile(token) {
  try {
    const response = await api.get('/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { errors: { general: 'Failed to fetch profile' } };
  }
}

export const handleLogout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    delete api.defaults.headers.common['Authorization'];
    window.location.reload();
  }
};

export const sendPasswordResetCode = async (email) => {
  try {
    const response = await api.post('/password/forgot', { email });
    if (response.data.status === 'error') {
      throw response.data;
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { errors: { general: 'Failed to send reset code' } };
  }
};

export const verifyResetCode = async (email, code) => {
  try {
    const response = await api.post('/password/verify-code', { email, code });
    if (response.data.status === 'error') {
      throw response.data;
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { errors: { general: 'Failed to verify code' } };
  }
};

export const resetPassword = async (email, code, password, password_confirmation) => {
  try {
    const response = await api.post('/password/reset', {
      email,
      code,
      password,
      password_confirmation
    });
    if (response.data.status === 'error') {
      throw response.data;
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { errors: { general: 'Failed to reset password' } };
  }
};

// Initialize auth header if token exists only in browser environment
if (typeof window !== "undefined") {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
}