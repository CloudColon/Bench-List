'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI, setAuthTokens, clearAuthTokens, getAccessToken } from '@/lib/api';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = getAccessToken();

      if (token) {
        try {
          const response = await authAPI.getCurrentUser();
          setUser(response.data);
        } catch (error) {
          console.error('Failed to load user:', error);
          clearAuthTokens();
        }
      }

      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { access, refresh } = response.data;

      setAuthTokens(access, refresh);

      // Fetch user data
      const userResponse = await authAPI.getCurrentUser();
      setUser(userResponse.data);

      router.push('/dashboard');
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return {
        success: false,
        error: error.response?.data || { detail: 'Login failed' }
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);

      // Auto-login after registration
      const loginResult = await login(userData.email, userData.password);

      if (loginResult.success) {
        return { success: true, data: response.data };
      } else {
        return { success: true, data: response.data, autoLoginFailed: true };
      }
    } catch (error) {
      console.error('Registration failed:', error);
      return {
        success: false,
        error: error.response?.data || { detail: 'Registration failed' }
      };
    }
  };

  const logout = () => {
    clearAuthTokens();
    setUser(null);
    router.push('/');
  };

  const updateUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      setUser(response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Failed to update user:', error);
      return { success: false, error };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
