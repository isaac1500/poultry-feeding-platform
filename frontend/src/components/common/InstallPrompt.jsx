// frontend/src/components/common/InstallPrompt.jsx
import React, { useState, useEffect } from 'react';
import './InstallPrompt.module.css'; // Create this CSS file too

let deferredPrompt = null;

const InstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
      return;
    }

    // Check for iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      
      // Show prompt after 5 seconds
      setTimeout(() => {
        if (!localStorage.getItem('installPromptDismissed')) {
          setShowPrompt(true);
        }
      }, 5000);
    });

    // Check if app is already installed
    window.addEventListener('appinstalled', () => {
      console.log('App installed successfully!');
      setShowPrompt(false);
    });
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      deferredPrompt = null;
      setShowPrompt(false);
      localStorage.setItem('installPromptDismissed', 'true');
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('installPromptDismissed', 'true');
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <div className="install-prompt">
      <div className="prompt-content">
        <div className="prompt-icon">📱</div>
        <div className="prompt-text">
          <h4>Install Poultry App</h4>
          <p>Install this app on your {isIOS ? 'iPhone' : 'device'} for quick access</p>
        </div>
        <div className="prompt-actions">
          <button onClick={handleInstallClick} className="install-button">
            Install
          </button>
          <button onClick={handleDismiss} className="dismiss-button">
            Not Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;