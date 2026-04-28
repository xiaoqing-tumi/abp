import { useState, useEffect, useCallback } from 'react';
import { authAPI } from '../utils/api';

const initialUser = () => {
  const stored = localStorage.getItem('user');
  return stored ? JSON.parse(stored) : null;
};

export const useAuth = () => {
  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (personCode) => {
    setLoading(true);
    try {
      const response = await authAPI.login(personCode);
      if (response.data.code === 200) {
        const data = response.data.data;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        return { success: true, message: '登录成功' };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || '登录失败' };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const isLoggedIn = useCallback(() => {
    return !!user && !!localStorage.getItem('token');
  }, [user]);

  const getCurrentUser = useCallback(() => {
    return user;
  }, [user]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      const stored = localStorage.getItem('user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    }
  }, [user]);

  return {
    user,
    loading,
    login,
    logout,
    isLoggedIn,
    getCurrentUser,
  };
};