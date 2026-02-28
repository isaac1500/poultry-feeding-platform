// src/services/api/client.js - FIXED VERSION
import axios from 'axios';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: 'http://localhost:8000', // Your FastAPI backend URL
  timeout: 30000, // 30 seconds timeout for recommendations
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Try to get token from localStorage or sessionStorage
    let token = localStorage.getItem('authToken') || 
                sessionStorage.getItem('authToken') ||
                localStorage.getItem('token') || 
                sessionStorage.getItem('token');
    
    // If using Firebase, you might have a different token structure
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        token = user.stsTokenManager?.accessToken || user.accessToken || token;
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling - FIXED!
apiClient.interceptors.response.use(
  (response) => {
    // FIX: Return only the data from the response
    // Your backend returns { success: true, data: {...} }
    return response.data;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.config?.url);
    
    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.error('Unauthorized - Please login again');
          // Clear local storage
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          localStorage.removeItem('authToken');
          sessionStorage.removeItem('user');
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('authToken');
          
          // Redirect to login if not already there
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
          }
          break;
          
        case 403:
          console.error('Forbidden: You do not have permission');
          break;
          
        case 404:
          console.error('Resource not found:', error.config.url);
          break;
          
        case 422:
          console.error('Validation error:', error.response.data?.detail);
          break;
          
        case 500:
          console.error('Server error:', error.response.data?.detail);
          break;
          
        default:
          console.error('API Error:', error.response.data);
      }
    } else if (error.request) {
      console.error('No response from server. Check if backend is running at http://localhost:8000');
      console.error('Start backend with: uvicorn app.main:app --reload --port 8000');
    } else {
      console.error('Request setup error:', error.message);
    }
    
    // Return a formatted error for components to handle
    return Promise.reject({
      message: error.response?.data?.detail || error.message || 'An error occurred',
      status: error.response?.status,
      data: error.response?.data
    });
  }
);

export default apiClient;