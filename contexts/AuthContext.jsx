"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import profileService from '@/lib/profile-service';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  

  const login = async (userData, token) => {
    try {
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userData.id_profile);
      localStorage.setItem('userRole', userData.user_type);
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Validate the user data after login
      const validatedUser = await profileService.getProfile();
      
      setUser({      id: validatedUser.id_profile,
      name: validatedUser.name,
      email: validatedUser.email,
      role: validatedUser.user_type || 'VIEWER',
      profileType: 'Standard',
      profileImage: validatedUser.avatar || '/placeholder-user.jpg'
    });
    setIsLoggedIn(true);
    } catch (error) {
      console.error('Login failed:', error);
      localStorage.clear();
      setUser(null);
      setIsLoggedIn(false);
      throw error;
    }
  };

  const logout = () => {
    localStorage.clear();
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