// frontend/src/components/common/OfflineIndicator/OfflineIndicator.jsx
import React, { useState, useEffect } from 'react';
import './OfflineIndicator.module.css'; // We'll create this CSS file

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowMessage(true);
      // Hide message after 3 seconds
      setTimeout(() => setShowMessage(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showMessage) return null;

  return (
    <div className={`offline-indicator ${isOnline ? 'online' : 'offline'}`}>
      <div className="indicator-content">
        <span className="indicator-icon">
          {isOnline ? '✅' : '📶'}
        </span>
        <span className="indicator-text">
          {isOnline ? 'Back online - Data synced' : 'You are offline - Using cached data'}
        </span>
        <button 
          onClick={() => setShowMessage(false)} 
          className="close-btn"
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default OfflineIndicator;