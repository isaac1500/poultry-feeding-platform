// src/pages/Flocks/FlockForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { flockService } from '../../services/flocks';
import { useAuth } from '../../contexts/AuthContext';
import './FlockForm.css';

export default function FlockForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  
  // State Management
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [formData, setFormData] = useState({
    name: '',
    birdType: 'broiler',
    quantity: '',
    age: '',
    housingType: 'deep_litter',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Network Status Effect
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('✅ ' + t('flocks.onlineStatus'));
    };
    const handleOffline = () => {
      setIsOnline(false);
      console.log('📴 ' + t('flocks.offlineStatus'));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [t]);
  
  // Load Flock Data Effect
  useEffect(() => {
    if (id) {
      loadFlockData();
    }
  }, [id]);
  
  // Data Loading
  const loadFlockData = async () => {
    try {
      setLoading(true);
      const flock = await flockService.getFlock(id);
      setFormData({
        name: flock.name || '',
        birdType: flock.birdType || 'broiler',
        quantity: flock.quantity || '',
        age: flock.age || '',
        housingType: flock.housingType || 'deep_litter',
        notes: flock.notes || ''
      });
    } catch (error) {
      setError(t('flocks.errors.loadFailed', { message: error.message }));
    } finally {
      setLoading(false);
    }
  };
  
  // Form Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const validateForm = () => {
    if (!formData.name.trim()) {
      setError(t('flocks.validation.nameRequired'));
      return false;
    }
    
    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      setError(t('flocks.validation.quantityRequired'));
      return false;
    }
    
    if (!user) {
      setError(t('flocks.validation.loginRequired'));
      return false;
    }
    
    return true;
  };
  
  const saveOffline = (flockData) => {
    console.log('📴 ' + t('flocks.savingOffline'));
    
    const offlineFlocks = JSON.parse(localStorage.getItem('offline_flocks') || '[]');
    const offlineId = `offline_${Date.now()}`;
    
    const offlineFlock = {
      ...flockData,
      id: offlineId,
      userId: user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      offline: true,
      synced: false
    };
    
    offlineFlocks.push(offlineFlock);
    localStorage.setItem('offline_flocks', JSON.stringify(offlineFlocks));
    
    const offlineActions = JSON.parse(localStorage.getItem('offline_actions') || '[]');
    offlineActions.push({
      type: id ? 'UPDATE_FLOCK' : 'CREATE_FLOCK',
      data: flockData,
      offlineId: id || offlineId,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('offline_actions', JSON.stringify(offlineActions));
    
    return offlineFlock;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      console.log('📝 ' + t('flocks.savingFlock'), '- Online:', isOnline);
      
      const flockData = {
        name: formData.name.trim(),
        birdType: formData.birdType,
        quantity: parseInt(formData.quantity),
        age: formData.age ? parseInt(formData.age) : 0,
        housingType: formData.housingType,
        notes: formData.notes || ''
      };
      
      let result;
      
      if (isOnline) {
        if (id) {
          result = await flockService.updateFlock(id, flockData);
          setSuccess(t('flocks.success.updated'));
        } else {
          result = await flockService.createFlock(flockData);
          setSuccess(t('flocks.success.created'));
        }
      } else {
        result = saveOffline(flockData);
        setSuccess(t('flocks.success.savedLocally'));
      }
      
      console.log(t('flocks.saveResult'), result);
      
      setTimeout(() => {
        navigate('/flocks');
      }, 2000);
      
    } catch (error) {
      console.error(t('flocks.saveError'), error);
      setError(t('flocks.errors.saveFailed', { message: error.message }));
    } finally {
      setSaving(false);
    }
  };
  
  const handleDebugClick = () => {
    console.log('Offline flocks:', JSON.parse(localStorage.getItem('offline_flocks') || '[]'));
    console.log('Offline actions:', JSON.parse(localStorage.getItem('offline_actions') || '[]'));
    alert(t('flocks.debug.checkConsole'));
  };
  
  if (loading) {
    return <LoadingState t={t} />;
  }
  
  return (
    <div className="flock-form-page">
      <div className="flock-form-container">
        <FormHeader title={id ? t('flocks.editFlock') : t('flocks.addNewFlock')} />
        
        <NetworkStatusBanner isOnline={isOnline} t={t} />
        
        {error && <Alert type="error" message={error} t={t} />}
        {success && <Alert type="success" message={success} t={t} />}
        
        <div className="form-card">
          <form onSubmit={handleSubmit} className="flock-form">
            <FormInput
              label={t('flocks.form.name')}
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder={t('flocks.form.namePlaceholder')}
              required
              disabled={saving}
            />
            
            <FormSelect
              label={t('flocks.form.birdType')}
              name="birdType"
              value={formData.birdType}
              onChange={handleChange}
              disabled={saving}
              options={[
                { value: 'broiler', label: t('flocks.birdTypes.broiler') },
                { value: 'layer', label: t('flocks.birdTypes.layer') },
                { value: 'breeder', label: t('flocks.birdTypes.breeder') },
                { value: 'local', label: t('flocks.birdTypes.local') }
              ]}
              required
            />
            
            <FormInput
              label={t('flocks.form.quantity')}
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange}
              placeholder={t('flocks.form.quantityPlaceholder')}
              min="1"
              required
              disabled={saving}
            />
            
            <FormInput
              label={`${t('flocks.form.age')} (${t('flocks.weeks')})`}
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              placeholder={t('flocks.form.agePlaceholder')}
              min="0"
              disabled={saving}
            />
            
            <FormSelect
              label={t('flocks.form.housingType')}
              name="housingType"
              value={formData.housingType}
              onChange={handleChange}
              disabled={saving}
              options={[
                { value: 'deep_litter', label: t('flocks.housingTypes.deepLitter') },
                { value: 'cage', label: t('flocks.housingTypes.cage') },
                { value: 'free_range', label: t('flocks.housingTypes.freeRange') },
                { value: 'battery_cage', label: t('flocks.housingTypes.batteryCage') }
              ]}
            />
            
            <FormTextarea
              label={t('flocks.form.notes')}
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder={t('flocks.form.notesPlaceholder')}
              disabled={saving}
            />
            
            <FormActions
              saving={saving}
              isOnline={isOnline}
              isEdit={!!id}
              onCancel={() => navigate('/flocks')}
              t={t}
            />
          </form>
          
          <DebugPanel
            isOnline={isOnline}
            user={user}
            onDebugClick={handleDebugClick}
            t={t}
          />
        </div>
      </div>
    </div>
  );
}

// Sub-components
function LoadingState({ t }) {
  return (
    <div className="loading-state">
      <h2>{t('flocks.loadingData')}</h2>
      <div className="spinner-large"></div>
    </div>
  );
}

function FormHeader({ title }) {
  return (
    <div className="form-header">
      <h1>{title}</h1>
    </div>
  );
}

function NetworkStatusBanner({ isOnline, t }) {
  return (
    <div className={`network-banner ${isOnline ? 'online' : 'offline'}`}>
      <span className="network-icon">{isOnline ? '🌐' : '📴'}</span>
      <div className="network-content">
        <strong>{isOnline ? t('flocks.statusOnline') : t('flocks.statusOffline')}</strong>
        <p>
          {isOnline 
            ? t('flocks.statusOnlineMessage') 
            : t('flocks.statusOfflineMessage')}
        </p>
      </div>
    </div>
  );
}

function Alert({ type, message, t }) {
  return (
    <div className={`alert alert-${type}`}>
      <span className="alert-icon">{type === 'error' ? '⚠️' : '✓'}</span>
      <div className="alert-content">
        <strong>{type === 'error' ? t('common.error') : t('common.success')}:</strong>
        <span>{message}</span>
      </div>
    </div>
  );
}

function FormInput({ label, name, type, value, onChange, placeholder, required, disabled, min }) {
  return (
    <div className="form-group">
      <label htmlFor={name}>
        {label} {required && <span className="required">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        min={min}
        className="form-input"
        aria-label={label}
      />
    </div>
  );
}

function FormSelect({ label, name, value, onChange, disabled, options, required }) {
  return (
    <div className="form-group">
      <label htmlFor={name}>
        {label} {required && <span className="required">*</span>}
      </label>
      <div className="select-wrapper">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="form-select"
          aria-label={label}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="select-arrow">▼</span>
      </div>
    </div>
  );
}

function FormTextarea({ label, name, value, onChange, placeholder, disabled }) {
  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="form-textarea"
        aria-label={label}
        rows="4"
      />
    </div>
  );
}

function FormActions({ saving, isOnline, isEdit, onCancel, t }) {
  const getButtonText = () => {
    if (saving) return t('flocks.form.saving');
    if (!isOnline) return t('flocks.form.saveLocally');
    return isEdit ? t('flocks.form.updateFlock') : t('flocks.form.saveFlock');
  };

  const getButtonIcon = () => {
    if (saving) return <div className="spinner-small"></div>;
    if (!isOnline) return <span>📴</span>;
    return null;
  };

  return (
    <div className="form-actions">
      <button
        type="submit"
        className={`btn btn-primary ${!isOnline ? 'btn-offline' : ''}`}
        disabled={saving}
        aria-busy={saving}
      >
        {getButtonIcon()}
        {getButtonText()}
      </button>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={onCancel}
        disabled={saving}
      >
        {t('common.cancel')}
      </button>
    </div>
  );
}

function DebugPanel({ isOnline, user, onDebugClick, t }) {
  const offlineFlocks = JSON.parse(localStorage.getItem('offline_flocks') || '[]').length;
  const offlineActions = JSON.parse(localStorage.getItem('offline_actions') || '[]').length;

  return (
    <div className="debug-panel">
      <h4>{t('common.debugInfo')}:</h4>
      <div className="debug-info">
        <DebugItem 
          label={t('flocks.debug.network')} 
          value={isOnline ? `✅ ${t('network.online')}` : `📴 ${t('network.offline')}`} 
        />
        <DebugItem 
          label={t('flocks.debug.user')} 
          value={user?.email || t('flocks.debug.notLoggedIn')} 
        />
        <DebugItem 
          label={t('flocks.debug.offlineFlocks')} 
          value={offlineFlocks} 
        />
        <DebugItem 
          label={t('flocks.debug.offlineActions')} 
          value={offlineActions} 
        />
      </div>
      <button 
        onClick={onDebugClick}
        className="btn btn-debug"
      >
        {t('flocks.debug.showOfflineData')}
      </button>
    </div>
  );
}

function DebugItem({ label, value }) {
  return (
    <div className="debug-item">
      <span className="debug-label">{label}:</span>
      <span className="debug-value">{value}</span>
    </div>
  );
}