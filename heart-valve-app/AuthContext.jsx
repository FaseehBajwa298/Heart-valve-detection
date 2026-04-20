import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

// ✅ Change this to your actual backend URL
const API_BASE = 'http://YOUR_BACKEND_URL_HERE';

const apiFetch = async (path, options = {}) => {
  const token = await AsyncStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    return { ok: false, status: res.status, data };
  }
  return { ok: true, status: res.status, data };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        const storedToken = await AsyncStorage.getItem('token');
        if (storedUser) setUser(JSON.parse(storedUser));
        if (storedToken) setToken(storedToken);
      } catch (e) {
        console.error('Failed to load auth from storage', e);
      } finally {
        setLoading(false);
      }
    };
    loadStoredAuth();
  }, []);

  const login = async (email, password) => {
    const res = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      return { success: false, message: res.data?.message || 'Login failed' };
    }
    setUser(res.data.user);
    setToken(res.data.token);
    await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
    await AsyncStorage.setItem('token', res.data.token);
    return { success: true };
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('token');
  };

  const signup = async (userData) => {
    const res = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (!res.ok) {
      return { success: false, message: res.data?.message || 'Signup failed' };
    }
    setUser(res.data.user);
    setToken(res.data.token);
    await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
    await AsyncStorage.setItem('token', res.data.token);
    return { success: true };
  };

  const value = { user, login, logout, signup, token };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
