import apiClient from './api/client';

export const authService = {
  // Login with Firebase or mock
  async login(email, password) {
    try {
      // For now, use mock login for development
      console.log('Attempting login with:', email);

      // SIMPLE MOCK LOGIN - Always succeeds
      const mockUser = {
        id: 'user_' + Date.now(),
        email: email,
        name: email.split('@')[0] || 'Test User',
        token: 'mock_token_' + Date.now(),
        accessToken: 'mock_access_token_' + Date.now(),
        role: 'farmer'
      };

      console.log('Mock login successful:', mockUser);
      return mockUser;

    } catch (error) {
      console.error('Login error:', error);

      // Fallback mock user
      const mockUser = {
        id: 'user_' + Date.now(),
        email: email,
        name: 'Test User',
        token: 'mock_token_error',
        accessToken: 'mock_access_error'
      };

      return mockUser;
    }
  },

  // Register new user
  async register(userData) {
    try {
      console.log('Registering user:', userData.email);

      // Mock registration
      const mockUser = {
        id: 'user_' + Date.now(),
        email: userData.email,
        name: userData.name || userData.email.split('@')[0],
        token: 'mock_reg_token_' + Date.now(),
        accessToken: 'mock_reg_access_' + Date.now()
      };

      console.log('Mock registration successful:', mockUser);
      return mockUser;

    } catch (error) {
      console.error('Registration error:', error);

      const mockUser = {
        id: 'user_' + Date.now(),
        email: userData.email,
        name: userData.name || 'New User',
        token: 'mock_reg_token_error'
      };

      return mockUser;
    }
  },

  // Logout
  logout() {
    console.log('Logging out...');
    return Promise.resolve();
  },

  // Get current user from storage
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};
