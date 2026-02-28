// src/components/TestLogin.jsx
import React, { useState } from 'react';
import { useAuth } from './common/authcontext.jsx';

const TestLogin = () => {
  const { login, user } = useAuth();
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('test123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await login(email, password);
      console.log('Login result:', result);
      alert('Login successful! Check console for details.');
    } catch (err) {
      setError(err.message || 'Login failed');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = () => {
    console.log('Current user:', user);
    console.log('localStorage user:', localStorage.getItem('user'));
    console.log('localStorage token:', localStorage.getItem('token'));
  };

  const clearAuth = () => {
    localStorage.clear();
    sessionStorage.clear();
    alert('Auth data cleared. Refresh page.');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>Test Login</h2>
      
      {user ? (
        <div>
          <h3>✅ Logged in as: {user.email}</h3>
          <button onClick={checkAuth} style={{ margin: '10px' }}>
            Check Auth State
          </button>
          <button onClick={clearAuth} style={{ margin: '10px' }}>
            Clear Auth
          </button>
        </div>
      ) : (
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '15px' }}>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
              required
            />
          </div>
          
          {error && (
            <div style={{ color: 'red', marginBottom: '10px' }}>
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={loading}
            style={{ padding: '10px 20px', background: '#4CAF50', color: 'white', border: 'none' }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      )}
      
      <div style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
        <h4>Debug Info:</h4>
        <button onClick={checkAuth} style={{ marginRight: '10px' }}>
          Check Auth State
        </button>
        <button onClick={clearAuth}>
          Clear All Auth Data
        </button>
      </div>
    </div>
  );
};

export default TestLogin;
