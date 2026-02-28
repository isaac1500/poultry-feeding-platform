// src/pages/NotFound/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found">
      <div className="not-found-content">
        <div className="error-code">
          <h1>404</h1>
          <h2>Page Not Found</h2>
        </div>
        
        <div className="error-message">
          <p>Oops! The page you're looking for doesn't exist or has been moved.</p>
          <p>Don't worry, let's get you back on track.</p>
        </div>

        <div className="suggestions">
          <h3>Here are some helpful links:</h3>
          <div className="suggestion-links">
            <Link to="/dashboard" className="suggestion-link">
              <span></span>
              <div>
                <strong>Dashboard</strong>
                <small>Return to your main dashboard</small>
              </div>
            </Link>
            <Link to="/flocks" className="suggestion-link">
              <span></span>
              <div>
                <strong>Flocks</strong>
                <small>Manage your poultry flocks</small>
              </div>
            </Link>
            <Link to="/recommendations" className="suggestion-link">
              <span></span>
              <div>
                <strong>Recommendations</strong>
                <small>Get AI feed recommendations</small>
              </div>
            </Link>
            <Link to="/help" className="suggestion-link">
              <span></span>
              <div>
                <strong>Help Center</strong>
                <small>Get assistance and support</small>
              </div>
            </Link>
          </div>
        </div>

        <div className="action-buttons">
          <Link to="/dashboard" className="primary-btn">
            Go to Dashboard
          </Link>
          <button onClick={() => window.history.back()} className="secondary-btn">
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
