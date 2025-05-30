"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const validateAuth = async () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      // Early return if no credentials - this is an expected state
      if (!token || !userId) {
        setIsLoading(false);
        setIsLoggedIn(false);
        setUser(null);
        return;
      }      try {
        // Implement retry logic with increased timeout
        const maxRetries = 3;
        const timeout = 15000; // 15 seconds
        
        let lastError;
        for (let attempt = 0; attempt < maxRetries; attempt++) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const response = await api.get('/profile', {
              signal: controller.signal
            });
            clearTimeout(timeoutId);

        const userData = response.data.user;
        if (!userData) {
          throw new Error('Invalid user data');
        }

        setUser({
          id: userData.id_profile,
          name: userData.name,
          email: userData.email,
          role: userData.user_type || 'VIEWER',
          profileType: 'Standard',
          profileImage: '/placeholder.svg?height=40&width=40'
        });
        setIsLoggedIn(true);            if (!response?.data?.user) {
              throw new Error('Invalid user data');
            }

            // If successful, break out of retry loop
            lastError = null;
            break;
          } catch (err) {
            lastError = err;
            // If it's the last attempt, or if it's a 401, don't retry
            if (attempt === maxRetries - 1 || err.response?.status === 401) {
              throw err;
            }
            // Wait a bit before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          }
        }

        if (lastError) {
          throw lastError;
        }
      } catch (error) {
        // Only log errors if they're unexpected (not auth-related)
        if (error.response?.status !== 401) {
          console.error('Profile validation error:', error.message || error);
        }
        localStorage.clear();
        setUser(null);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    validateAuth();
  }, [router]);

  const login = async (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userData.id_profile);
    localStorage.setItem('userRole', userData.user_type);
    
    setUser({
      id: userData.id_profile,
      name: userData.name,
      email: userData.email,
      role: userData.user_type || 'VIEWER',
      profileType: 'Standard',
      profileImage: '/placeholder.svg?height=40&width=40'
    });
    setIsLoggedIn(true);

    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setIsLoggedIn(false);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}