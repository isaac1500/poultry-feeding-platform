// frontend/src/components/common/InstallPrompt/InstallPrompt.jsx
import React, { useState, useEffect } from 'react';
import './InstallPrompt.module.css';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed
    const dismissed = localStorage.getItem('installPromptDismissed');
    if (dismissed) {
      const dismissTime = parseInt(dismissed);
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      if (dismissTime > sevenDaysAgo) {
        setIsDismissed(true);
      }
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt after 30 seconds if not dismissed
      if (!isDismissed) {
        setTimeout(() => {
          setShowPrompt(true);
        }, 30000);
      }
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      console.log('App installed successfully');
      setShowPrompt(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isDismissed]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted install prompt');
      setShowPrompt(false);
      localStorage.setItem('installPromptDismissed', Date.now().toString());
    }
    
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setIsDismissed(true);
    localStorage.setItem('installPromptDismissed', Date.now().toString());
  };

  if (!showPrompt || isDismissed) {
    return null;
  }

  return (
    <div className="install-prompt">
      <div className="prompt-card">
        <div className="prompt-header">
          <span className="prompt-icon">📱</span>
          <h3>Install Poultry Feed App</h3>
          <button 
            onClick={handleDismiss} 
            className="prompt-close"
            aria-label="Close install prompt"
          >
            ×
          </button>
        </div>
        <div className="prompt-body">
          <p>Install for faster access, offline usage, and home screen convenience</p>
          <ul className="prompt-features">
            <li>✓ Works offline</li>
            <li>✓ Faster loading</li>
            <li>✓ Home screen access</li>
          </ul>
        </div>
        <div className="prompt-actions">
          <button onClick={handleInstall} className="install-btn">
            Install Now
          </button>
          <button onClick={handleDismiss} className="dismiss-btn">
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;