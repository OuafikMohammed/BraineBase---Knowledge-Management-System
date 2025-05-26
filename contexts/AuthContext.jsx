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
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');

        if (!token || !userId) {
          throw new Error('No auth credentials');
        }

        // Verify token is valid by making a request to the backend
        const response = await api.get('/profile');
        const userData = response.data.user;

        setUser({
          id: userData.id_profile,
          name: userData.name,
          email: userData.email,
          role: userData.user_type || 'VIEWER',
          profileType: 'Standard',
          profileImage: '/placeholder.svg?height=40&width=40'
        });
        setIsLoggedIn(true);

      } catch (error) {
        console.error('Auth validation error:', error);
        // Clear invalid auth state
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        setUser(null);
        setIsLoggedIn(false);
        router.push('/login');
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
    router.push('/login');
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