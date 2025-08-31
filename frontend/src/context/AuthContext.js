import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Set auth token header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Get user data
        const res = await axios.get('/api/auth/profile');
        
        setUser(res.data);
        setError(null);
      } catch (err) {
        console.error('Error loading user:', err);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setError('Authentication failed. Please login again.');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login user
  const login = async (identifier, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.post('/api/auth/login', { identifier, password });
      
      // Save token to localStorage
      localStorage.setItem('token', res.data.token);
      
      // Set auth token header
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      
      setUser(res.data);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.post('/api/auth/register', userData);
      
      // Save token to localStorage
      localStorage.setItem('token', res.data.token);
      
      // Set auth token header
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      
      setUser(res.data);
      return true;
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isStudent: user?.role === 'student',
        isFaculty: user?.role === 'faculty',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};