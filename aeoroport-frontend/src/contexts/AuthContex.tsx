// contexts/AuthContext.tsx - Fixed version
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../interceptor/api';

interface User {
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      console.log('🔐 Attempting login with:', username);
      
      // Send JSON to /auth/login (your simple endpoint)
      const response = await api.post("/auth/login", {
        username,
        password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Login response:', response.data);
      
      const { username: userUsername, role, access_token } = response.data;
      
      // Save user info
      const userData = { 
        username: userUsername, 
        role: role || 'ADMIN' // Default to ADMIN if not provided
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', access_token);
      
      // Add token to API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      setUser(userData);
      
    } catch (error: any) {
      console.error('❌ Login error details:');
      console.error('Error message:', error.message);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};