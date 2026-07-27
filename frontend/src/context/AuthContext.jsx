import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  // Configure Axios defaults when token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
      
      // Fetch user profile to verify token validity and load context details
      axios.get('/api/auth/me')
        .then(res => {
          setUser(res.data);
        })
        .catch(err => {
          console.error('Verify token failed:', err);
          // Token expired or invalid
          logout();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      setToken(res.data.token);
      setUser(res.data);
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Login failed');
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await axios.post('/api/auth/register', { name, email, password });
      setToken(res.data.token);
      setUser(res.data);
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await axios.put('/api/users/profile', profileData);
      setUser(res.data);
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Profile update failed');
    }
  };

  const updateAvatar = async (formData) => {
    try {
      const res = await axios.post('/api/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUser(prev => ({ ...prev, avatar: res.data.avatar }));
      return res.data.avatar;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Avatar upload failed');
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    updateAvatar,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
