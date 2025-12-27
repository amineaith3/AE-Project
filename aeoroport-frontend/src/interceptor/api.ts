import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:8000', // Your FastAPI base URL
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Request interceptor to add authentication headers
api.interceptors.request.use(
  (config) => {
    // Get credentials from environment variables or config
    const dbUser = 'USER_ADMIN';
    const dbPassword = 'admin123';
    
    // Add custom headers
    config.headers['x-db-user'] = dbUser;
    config.headers['x-db-password'] = dbPassword;
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error('Authentication failed');
    } else if (error.response?.status === 403) {
      console.error('Forbidden access');
    } else if (error.response?.status === 404) {
      console.error('Resource not found');
    }
    
    return Promise.reject(error);
  }
);

export default api;