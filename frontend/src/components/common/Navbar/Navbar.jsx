import { Link } from 'react-router-dom';
import { useAuth } from '../authcontext.jsx';
import './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <div className="navbar-brand">
          <Link to="/" className="navbar-logo">
            <h1>Poultry Feeding Platform</h1>
          </Link>
        </div>
        
        <div className="navbar-menu">
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/flocks" className="nav-link">Flocks</Link>
              <Link to="/recommendations" className="nav-link">Recommendations</Link>
              <Link to="/progress" className="nav-link">Progress</Link>
              <Link to="/settings" className="nav-link">Settings</Link>
              <div className="user-menu">
                <span className="user-email">{user.email}</span>
                <button onClick={handleLogout} className="btn-logout">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="btn-register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
