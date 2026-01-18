import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../../utils/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    console.log('Attempting login with:', email);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful! User:', userCredential.user);
      console.log('User email:', userCredential.user.email);
      console.log('User UID:', userCredential.user.uid);
      
      // Wait a moment to ensure auth state is updated
      setTimeout(() => {
        console.log('Redirecting to dashboard...');
        navigate('/dashboard');
      }, 100);
      
    } catch (error) {
      console.error('Login error details:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
