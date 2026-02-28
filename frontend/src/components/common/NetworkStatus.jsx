// src/components/common/NetworkStatus.jsx - SIMPLE VERSION
import React, { useState, useEffect } from 'react';

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShow(true);
      setTimeout(() => setShow(false), 5000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShow(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '70px',
      right: '20px',
      zIndex: 9999,
      padding: '10px 16px',
      background: isOnline ? '#4CAF50' : '#FF9800',
      color: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      animation: 'slideIn 0.3s ease-out'
    }}>
      <span style={{ fontSize: '18px' }}>{isOnline ? '🌐' : '📴'}</span>
      <div>
        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
          {isOnline ? 'Back Online' : 'You are Offline'}
        </div>
        <div style={{ fontSize: '12px', opacity: 0.9 }}>
          {isOnline ? 'Syncing data...' : 'Working locally'}
        </div>
      </div>
      <button 
        onClick={() => setShow(false)}
        style={{
          background: 'rgba(255,255,255,0.2)',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          fontSize: '18px',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        ×
      </button>
      
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default NetworkStatus;