import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize and verify user session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('accessToken');
      const savedUser = localStorage.getItem('user');

      if (savedToken && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          
          // Verify token and fetch fresh user profile from DB
          const res = await api.get('/auth/me');
          if (res.data && res.data.success) {
            const freshUser = res.data.data;
            setUser(freshUser);
            localStorage.setItem('user', JSON.stringify(freshUser));
          }
        } catch (error) {
          console.error('Session validation failed:', error.message);
          // Auto-clears on invalid token via interceptor or manually here
          logoutState();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const logoutState = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const login = async (emailOrUsername, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { emailOrUsername, password });
      if (response.data && response.data.success) {
        const { user: loggedUser, accessToken } = response.data.data;
        setUser(loggedUser);
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(loggedUser));
        return { success: true, user: loggedUser };
      }
    } catch (error) {
      logoutState();
      const message = error.response?.data?.message || 'Login failed. Please check credentials.';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data && response.data.success) {
        return { success: true, user: response.data.data };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed.';
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout', {});
    } catch (error) {
      console.error('Logout API warning:', error.message);
    } finally {
      logoutState();
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      if (response.data && response.data.success) {
        return { success: true, resetToken: response.data.data.resetToken };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Forgot password failed.';
      return { success: false, error: message };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      const response = await api.post('/auth/reset-password', { token, password });
      if (response.data && response.data.success) {
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset failed.';
      return { success: false, error: message };
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        updateUser,
        logout,
        forgotPassword,
        resetPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
};
