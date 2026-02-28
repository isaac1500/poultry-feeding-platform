// src/pages/Flocks/FlockList.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { flockService } from '../../services/flocks';
import { useAuth } from '../../contexts/AuthContext';
import './FlockList.css';

export default function FlockList() {
  const [flocks, setFlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // Network status listener
  useEffect(() => {
    console.log('🌐 ' + t('flocks.debug.networkStatus'), navigator.onLine);
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => {
      console.log('✅ ' + t('network.online'));
      setIsOnline(true);
      if (user) {
        setTimeout(() => {
          syncOfflineData();
          fetchFlocks();
        }, 1000);
      }
    };

    const handleOffline = () => {
      console.log('📴 ' + t('network.offline'));
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user, t]);

  // Fetch flocks on mount and user change
  useEffect(() => {
    console.log('FlockList: useEffect running, user:', user);
    if (user) {
      fetchFlocks();
    } else {
      setLoading(false);
      setError(t('flocks.errors.loginRequired'));
    }
  }, [user, t]);

  const fetchFlocks = async () => {
    try {
      console.log('FlockList: Starting to fetch flocks...');
      setLoading(true);
      setError('');
      
      const data = await flockService.getFlocks();
      console.log('FlockList: Fetched data:', data);
      
      const onlineFlocks = data.filter(f => !f.offline);
      const offlineFlocks = data.filter(f => f.offline);
      setFlocks([...onlineFlocks, ...offlineFlocks]);
      
      if (data.length === 0) {
        console.log('FlockList: No flocks found in database');
      }
    } catch (error) {
      console.error('FlockList: Error fetching flocks:', error);
      setError(t('flocks.errors.loadFailed', { message: error.message }));
    } finally {
      setLoading(false);
    }
  };

  const syncOfflineData = async () => {
    try {
      setSyncing(true);
      console.log('🔄 ' + t('flocks.network.startingSync'));
      const result = await flockService.syncOfflineFlocks();
      console.log('Sync result:', result);
      
      if (result.synced > 0) {
        console.log(t('flocks.network.syncedCount', { count: result.synced }));
        setTimeout(() => fetchFlocks(), 500);
      }
    } catch (error) {
      console.error(t('flocks.errors.syncError'), error);
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(t('flocks.deleteConfirm', { name }))) {
      try {
        await flockService.deleteFlock(id);
        fetchFlocks();
      } catch (error) {
        console.error(t('flocks.errors.deleteFlock'), error);
        alert(t('flocks.errors.deleteFlock', { message: error.message }));
      }
    }
  };

  const LanguageSwitcher = () => (
    <div className="language-switcher">
      <span>🌐</span>
      <select
        value={i18n.language}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
      >
        <option value="en">English</option>
        <option value="lg">Luganda</option>
      </select>
    </div>
  );

  const NetworkStatusBadge = () => (
    <div className={`network-badge ${isOnline ? 'online' : 'offline'}`}>
      <span>{isOnline ? '🌐' : '📴'}</span>
      {isOnline ? t('network.online') : t('network.offline')}
    </div>
  );

  if (loading) {
    return (
      <div className="flock-list-container">
        <NetworkStatusBadge />
        <LanguageSwitcher />
        
        <div className="page-header">
          <h1>{t('flocks.myFlocks')}</h1>
          <Link to="/flocks/new" className="btn btn-primary">
            + {t('flocks.addNewFlock')}
          </Link>
        </div>
        
        <div className="loading-state">
          <div className="loading-text">{t('flocks.loading')}</div>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flock-list-container">
      <NetworkStatusBadge />
      <LanguageSwitcher />
      
      {/* Offline Banner */}
      {!isOnline && (
        <div className="offline-banner">
          <div className="banner-content">
            <span className="banner-icon">📴</span>
            <div className="banner-text">
              <strong>{t('flocks.network.workingOffline')}</strong>
              <p>
                {flocks.filter(f => f.offline).length > 0 
                  ? t('flocks.network.localSaved', { count: flocks.filter(f => f.offline).length })
                  : t('flocks.network.saveLocal')}
              </p>
            </div>
          </div>
          <div className="offline-badge">
            {t('flocks.network.offlineMode')}
          </div>
        </div>
      )}
      
      {/* Sync Panel */}
      {isOnline && flocks.some(f => f.offline) && (
        <div className="sync-panel">
          <div className="sync-info">
            <span className="sync-icon">🔄</span>
            <div>
              <strong>{t('flocks.network.offlineData')}</strong>
              <p>{t('flocks.network.unsyncedFlocks', { count: flocks.filter(f => f.offline).length })}</p>
            </div>
          </div>
          <button 
            onClick={syncOfflineData}
            disabled={syncing}
            className={`btn btn-sync ${syncing ? 'syncing' : ''}`}
          >
            {syncing ? (
              <>
                <div className="spinner-small"></div>
                {t('flocks.syncing')}
              </>
            ) : t('flocks.syncNow')}
          </button>
        </div>
      )}
      
      {/* Page Header */}
      <div className="page-header">
        <h1>{t('flocks.myFlocks')}</h1>
        <Link 
          to="/flocks/new" 
          className={`btn ${isOnline ? 'btn-primary' : 'btn-warning'}`}
        >
          + {t('flocks.addNewFlock')}
          {!isOnline && <span className="local-badge">({t('flocks.local')})</span>}
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <strong>{t('common.error')}:</strong> {error}
        </div>
      )}

      {/* Empty State */}
      {flocks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🐔</div>
          <h2>{t('flocks.noFlocks')}</h2>
          <p>{t('flocks.firstFlockPrompt')}</p>
          <Link to="/flocks/new" className="btn btn-primary">
            {t('flocks.addFirstFlock')}
          </Link>
          
          {/* Debug Info */}
          <div className="debug-panel">
            <h4>{t('flocks.debug.debugInfo')}:</h4>
            <p><strong>{t('flocks.debug.networkStatus')}:</strong> {isOnline ? '✅ ' + t('network.online') : '📴 ' + t('network.offline')}</p>
            <p><strong>{t('flocks.debug.user')}:</strong> {user ? `${t('flocks.loggedIn')} ${user.email}` : t('flocks.notLoggedIn')}</p>
            <p><strong>{t('flocks.debug.userUID')}:</strong> {user?.uid?.substring(0, 8) || 'No UID'}...</p>
            <p><strong>{t('flocks.debug.localStorage')}:</strong> {JSON.parse(localStorage.getItem('offline_flocks') || '[]').length} {t('flocks.offline')} {t('flocks.flocks')}</p>
            <button onClick={fetchFlocks} className="btn btn-secondary">
              {t('flocks.refreshData')}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Flocks Table */}
          <div className="flocks-table">
            <div className="table-header">
              <div>{t('flocks.flockName')}</div>
              <div>{t('flocks.birdType')}</div>
              <div>{t('flocks.quantity')}</div>
              <div>{t('flocks.age')}</div>
              {flocks.some(f => f.offline) && <div>{t('flocks.status')}</div>}
              <div>{t('flocks.actions')}</div>
            </div>
            
            {flocks.map((flock) => (
              <div 
                key={flock.id} 
                className={`table-row ${flock.offline ? 'offline-row' : ''}`}
                onClick={() => !flock.offline && navigate(`/flocks/${flock.id}`)}
                title={flock.offline ? t('flocks.offlineTooltip') : t('flocks.onlineTooltip')}
              >
                <div className="flock-name">
                  {flock.name}
                  {flock.offline && (
                    <span className="offline-indicator" title={t('flocks.offlineTooltip')}>
                      📴
                    </span>
                  )}
                </div>
                <div className="bird-type">{flock.birdType}</div>
                <div>{flock.quantity} {t('flocks.birds')}</div>
                <div>{flock.age || 'N/A'} {t('flocks.weeks')}</div>
                {flocks.some(f => f.offline) && (
                  <div>
                    {flock.offline && (
                      <span className="status-badge local">
                        {t('flocks.local')}
                      </span>
                    )}
                  </div>
                )}
                <div className="action-buttons">
                  {!flock.offline && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/flocks/${flock.id}/edit`);
                      }}
                      className="btn btn-edit"
                    >
                      {t('common.edit')}
                    </button>
                  )}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(flock.id, flock.name);
                    }}
                    className="btn btn-delete"
                  >
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Debug Panel */}
          <div className="debug-panel">
            <h4>{t('flocks.debug.debugInfo')}:</h4>
            <p><strong>{t('flocks.debug.networkStatus')}:</strong> {isOnline ? '✅ ' + t('network.online') : '📴 ' + t('network.offline')}</p>
            <p><strong>{t('flocks.debug.totalFlocks')}:</strong> {flocks.length}</p>
            <p><strong>{t('flocks.debug.onlineFlocks')}:</strong> {flocks.filter(f => !f.offline).length}</p>
            <p><strong>{t('flocks.debug.offlineFlocks')}:</strong> {flocks.filter(f => f.offline).length}</p>
            <p><strong>{t('flocks.debug.user')}:</strong> {user?.email}</p>
            <p><strong>{t('flocks.debug.userUID')}:</strong> {user?.uid?.substring(0, 8)}...</p>
            <button onClick={fetchFlocks} className="btn btn-secondary">
              {t('flocks.refreshData')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}