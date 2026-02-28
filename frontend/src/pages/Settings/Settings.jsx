// src/pages/Settings/Settings.jsx - UPDATED WITH i18n TRANSLATIONS
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';

export default function Settings() {
  const [settings, setSettings] = useState({
    email: '',
    farmName: '',
    location: '',
    emailNotifications: true,
    showLocalCurrency: true,
    language: 'en'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const { user } = useAuth();
  const { t, i18n } = useTranslation();

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // In a real app, you would fetch these from your backend/Firestore
      const savedSettings = JSON.parse(localStorage.getItem('user_settings') || '{}');
      
      setSettings({
        email: user?.email || '',
        farmName: savedSettings.farmName || '',
        location: savedSettings.location || '',
        emailNotifications: savedSettings.emailNotifications !== false,
        showLocalCurrency: savedSettings.showLocalCurrency !== false,
        language: savedSettings.language || i18n.language || 'en'
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      // Save to localStorage (in real app, save to Firestore/backend)
      localStorage.setItem('user_settings', JSON.stringify({
        farmName: settings.farmName,
        location: settings.location,
        emailNotifications: settings.emailNotifications,
        showLocalCurrency: settings.showLocalCurrency,
        language: settings.language
      }));

      // Change language if selected
      if (settings.language !== i18n.language) {
        await i18n.changeLanguage(settings.language);
      }

      setMessage(t('settings.saveSuccess'));
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage(t('settings.saveError'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '800px', margin: '2rem auto', textAlign: 'center' }}>
        <div style={{ 
          display: 'inline-block', 
          width: '40px', 
          height: '40px', 
          border: '4px solid #f3f3f3', 
          borderTop: '4px solid #3498db', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite' 
        }}></div>
        <p style={{ marginTop: '1rem' }}>{t('settings.loading')}</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem' }}>
      <h1>{t('settings.title')}</h1>
      
      {message && (
        <div style={{
          background: message.includes('Error') ? '#ffebee' : '#e8f5e9',
          color: message.includes('Error') ? '#c62828' : '#2e7d32',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '1rem',
          border: `1px solid ${message.includes('Error') ? '#ffcdd2' : '#c8e6c9'}`
        }}>
          {message}
        </div>
      )}

      {/* Account Settings */}
      <div style={{ 
        background: 'white', 
        padding: '2rem', 
        borderRadius: '8px', 
        marginTop: '1rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>{t('settings.account')}</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              {t('settings.email')}
            </label>
            <input 
              type="email" 
              value={settings.email}
              readOnly
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                border: '1px solid #ddd',
                borderRadius: '4px',
                background: '#f5f5f5',
                color: '#666'
              }}
            />
            <small style={{ color: '#666', fontSize: '0.9rem' }}>
              {t('settings.emailNote')}
            </small>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              {t('settings.farmName')}
            </label>
            <input 
              type="text" 
              name="farmName"
              value={settings.farmName}
              onChange={handleChange}
              placeholder={t('settings.farmNamePlaceholder')}
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              {t('settings.location')}
            </label>
            <input 
              type="text" 
              name="location"
              value={settings.location}
              onChange={handleChange}
              placeholder={t('settings.locationPlaceholder')}
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>
        </form>
      </div>
      
      {/* Preferences */}
      <div style={{ 
        background: 'white', 
        padding: '2rem', 
        borderRadius: '8px', 
        marginTop: '2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>{t('settings.preferences')}</h2>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              name="emailNotifications"
              checked={settings.emailNotifications}
              onChange={handleChange}
              style={{ 
                marginRight: '0.75rem',
                width: '18px',
                height: '18px',
                cursor: 'pointer'
              }}
            />
            <span>{t('settings.emailNotifications')}</span>
          </label>
          <small style={{ color: '#666', fontSize: '0.9rem', marginLeft: '2rem' }}>
            {t('settings.emailNotificationsNote')}
          </small>
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              name="showLocalCurrency"
              checked={settings.showLocalCurrency}
              onChange={handleChange}
              style={{ 
                marginRight: '0.75rem',
                width: '18px',
                height: '18px',
                cursor: 'pointer'
              }}
            />
            <span>{t('settings.showLocalCurrency')}</span>
          </label>
          <small style={{ color: '#666', fontSize: '0.9rem', marginLeft: '2rem' }}>
            {t('settings.currencyNote')}
          </small>
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            {t('settings.language')}
          </label>
          <select 
            name="language"
            value={settings.language}
            onChange={handleChange}
            style={{ 
              width: '100%', 
              padding: '0.75rem', 
              border: '1px solid #ddd',
              borderRadius: '4px',
              background: 'white',
              cursor: 'pointer'
            }}
          >
            <option value="en">{t('settings.english')}</option>
            <option value="lg">{t('settings.luganda')}</option>
          </select>
          <small style={{ color: '#666', fontSize: '0.9rem' }}>
            {t('settings.languageNote')}
          </small>
        </div>

        <button 
          type="submit" 
          onClick={handleSubmit}
          disabled={saving}
          style={{ 
            padding: '0.875rem 2rem', 
            background: saving ? '#ccc' : '#2E7D32', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            fontWeight: '600',
            cursor: saving ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          {saving ? (
            <>
              <div style={{ 
                width: '16px', 
                height: '16px', 
                border: '2px solid rgba(255,255,255,0.3)', 
                borderTop: '2px solid white', 
                borderRadius: '50%', 
                animation: 'spin 1s linear infinite' 
              }}></div>
              {t('settings.saving')}
            </>
          ) : (
            t('settings.saveChanges')
          )}
        </button>
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        input:focus, select:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
        }
      `}</style>
    </div>
  );
}