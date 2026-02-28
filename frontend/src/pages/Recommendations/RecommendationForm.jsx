import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { recommendationService } from '../../services/recommendations';
import { flockService } from '../../services/flocks';
import styles from './RecommendationForm.module.css';

const RecommendationForm = ({ onSuccess, initialFlockId = null }) => {
  const { t, i18n } = useTranslation();
  
  // State Management
  const [formData, setFormData] = useState({
    flock_id: initialFlockId || '',
    formulation_objective: 'minimize_cost',
    feed_type: 'starter',
    age_days: 1,
    quantity_kg: 10,
    target_weight_kg: '',
    current_weight_kg: '',
    constraints: {}
  });

  const [flocks, setFlocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingFlocks, setFetchingFlocks] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Network Status Effect
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch Flocks Effect
  useEffect(() => {
    fetchFlocks();
  }, []);

  // Handlers
  const fetchFlocks = async () => {
    try {
      setFetchingFlocks(true);
      const flocksData = await flockService.getFlocks();
      setFlocks(flocksData);
      
      if (initialFlockId && flocksData.length > 0) {
        const selectedFlock = flocksData.find(f => f.id === initialFlockId);
        if (selectedFlock) {
          setFormData(prev => ({
            ...prev,
            flock_id: initialFlockId,
            age_days: (selectedFlock.age || 1) * 7
          }));
        }
      }
    } catch (err) {
      setError(t('recommendations.errors.loadFlocks', { message: err.message }));
    } finally {
      setFetchingFlocks(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['age_days', 'quantity_kg'].includes(name) 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!formData.flock_id) {
        throw new Error(t('recommendations.validation.selectFlock'));
      }
      if (formData.quantity_kg <= 0) {
        throw new Error(t('recommendations.validation.quantityRequired'));
      }
      if (!isOnline) {
        throw new Error(t('recommendations.errors.offlineAI'));
      }
      
      const selectedFlock = flocks.find(f => f.id === formData.flock_id);
      const recommendationData = {
        ...formData,
        flockName: selectedFlock?.name || '',
        birdType: selectedFlock?.birdType || '',
        flockQuantity: selectedFlock?.quantity || 0
      };
      
      const result = await recommendationService.createRecommendation(recommendationData);
      setSuccess(t('recommendations.success.created'));
      
      if (onSuccess) onSuccess(result);

      setFormData(prev => ({
        ...prev,
        formulation_objective: 'minimize_cost',
        feed_type: 'starter',
        quantity_kg: 10,
        target_weight_kg: '',
        current_weight_kg: ''
      }));
    } catch (err) {
      setError(err.response?.data?.detail || err.message || t('recommendations.errors.createFailed'));
    } finally {
      setLoading(false);
    }
  };

  // Computed Values
  const selectedFlock = flocks.find(f => f.id === formData.flock_id);
  const canSubmit = !loading && flocks.length > 0 && isOnline;

  // Loading State
  if (fetchingFlocks) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>{t('recommendations.loadingFlocks')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>{t('recommendations.title')}</h2>
        
        {/* Language Switcher */}
        <div className={styles.languageSwitcher}>
          <span className={styles.globeIcon}>🌐</span>
          <select
            value={i18n.language}
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            className={styles.languageSelect}
          >
            <option value="en">English</option>
            <option value="lg">Luganda</option>
          </select>
        </div>
      </div>

      {/* Network Status Banner */}
      <div className={`${styles.statusBanner} ${isOnline ? styles.online : styles.offline}`}>
        <span className={styles.statusIcon}>{isOnline ? '🌐' : '📴'}</span>
        <div className={styles.statusContent}>
          <strong>{isOnline ? t('recommendations.statusOnline') : t('recommendations.statusOffline')}</strong>
          <p>{isOnline ? t('recommendations.statusOnlineMessage') : t('recommendations.statusOfflineMessage')}</p>
        </div>
      </div>

      {/* Alerts */}
      {error && <div className={styles.alert + ' ' + styles.alertError}>{error}</div>}
      {success && <div className={styles.alert + ' ' + styles.alertSuccess}>{success}</div>}

      {/* Debug Info */}
      <div className={styles.debugInfo}>
        <h3>{t('common.debugInfo')}</h3>
        <div className={styles.debugGrid}>
          <div className={styles.debugItem}>
            <span className={styles.debugLabel}>{t('recommendations.debug.networkStatus')}:</span>
            <span className={styles.debugValue}>{isOnline ? '✅ ' + t('network.online') : '📴 ' + t('network.offline')}</span>
          </div>
          <div className={styles.debugItem}>
            <span className={styles.debugLabel}>{t('recommendations.debug.totalFlocks')}:</span>
            <span className={styles.debugValue}>{flocks.length}</span>
          </div>
          <div className={styles.debugItem}>
            <span className={styles.debugLabel}>{t('recommendations.debug.selectedFlock')}:</span>
            <span className={styles.debugValue}>{formData.flock_id || t('recommendations.none')}</span>
          </div>
        </div>
        <button onClick={fetchFlocks} className={styles.refreshButton}>
          🔄 {t('recommendations.refreshFlocks')}
        </button>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Flock Selection */}
        <div className={styles.formGroup}>
          <label htmlFor="flock_id" className={styles.label}>
            {t('recommendations.form.selectFlock')} <span className={styles.required}>*</span>
          </label>
          <select
            id="flock_id"
            name="flock_id"
            value={formData.flock_id}
            onChange={handleChange}
            required
            disabled={flocks.length === 0 || !isOnline}
            className={styles.select}
          >
            <option value="">-- {t('recommendations.form.selectPlaceholder')} --</option>
            {flocks.length === 0 ? (
              <option value="" disabled>{t('recommendations.form.noFlocks')}</option>
            ) : (
              flocks.map(flock => (
                <option key={flock.id} value={flock.id}>
                  {flock.name} ({t(`flocks.birdTypes.${flock.birdType}`)}, {flock.quantity} {t('flocks.birds')}, {flock.age || t('recommendations.na')} {t('flocks.weeks')})
                </option>
              ))
            )}
          </select>
          
          {flocks.length === 0 ? (
            <div className={styles.noFlocks}>
              <p>{t('recommendations.form.noFlocksMessage')}</p>
              <a href="/flocks/new" className={styles.createFlockLink}>
                ➕ {t('recommendations.form.createFlockLink')}
              </a>
            </div>
          ) : selectedFlock && (
            <div className={styles.flockInfo}>
              <div className={styles.flockInfoItem}>
                <strong>{t('flocks.flockName')}:</strong> {selectedFlock.name}
              </div>
              <div className={styles.flockInfoItem}>
                <strong>{t('flocks.birdType')}:</strong> {t(`flocks.birdTypes.${selectedFlock.birdType}`)}
              </div>
              <div className={styles.flockInfoItem}>
                <strong>{t('flocks.age')}:</strong> {selectedFlock.age || t('recommendations.na')} {t('flocks.weeks')}
              </div>
              <div className={styles.flockInfoItem}>
                <strong>{t('flocks.birds')}:</strong> {selectedFlock.quantity}
              </div>
              {selectedFlock.offline && (
                <div className={`${styles.flockInfoItem} ${styles.offlineTag}`}>
                  📴 {t('flocks.local')}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Feed Type & Optimization Objective Row */}
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="feed_type" className={styles.label}>
              {t('recommendations.form.feedType')}
            </label>
            <select
              id="feed_type"
              name="feed_type"
              value={formData.feed_type}
              onChange={handleChange}
              disabled={!isOnline}
              className={styles.select}
            >
              <option value="starter">{t('recommendations.feedTypes.starter')}</option>
              <option value="grower">{t('recommendations.feedTypes.grower')}</option>
              <option value="finisher">{t('recommendations.feedTypes.finisher')}</option>
              <option value="layer">{t('recommendations.feedTypes.layer')}</option>
              <option value="broiler">{t('recommendations.feedTypes.broiler')}</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="formulation_objective" className={styles.label}>
              {t('recommendations.form.optimizationGoal')}
            </label>
            <select
              id="formulation_objective"
              name="formulation_objective"
              value={formData.formulation_objective}
              onChange={handleChange}
              disabled={!isOnline}
              className={styles.select}
            >
              <option value="minimize_cost">{t('recommendations.objectives.minimizeCost')}</option>
              <option value="maximize_growth">{t('recommendations.objectives.maximizeGrowth')}</option>
              <option value="balanced">{t('recommendations.objectives.balanced')}</option>
            </select>
            <small className={styles.helpText}>
              {formData.formulation_objective === 'minimize_cost' && t('recommendations.form.costHint')}
              {formData.formulation_objective === 'maximize_growth' && t('recommendations.form.growthHint')}
              {formData.formulation_objective === 'balanced' && t('recommendations.form.balancedHint')}
            </small>
          </div>
        </div>

        {/* Age & Quantity Row */}
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="age_days" className={styles.label}>
              {t('recommendations.form.age')} ({t('recommendations.days')}) <span className={styles.required}>*</span>
            </label>
            <input
              type="number"
              id="age_days"
              name="age_days"
              value={formData.age_days}
              onChange={handleChange}
              min="1"
              max="365"
              required
              disabled={!isOnline}
              className={styles.input}
            />
            <small className={styles.helpText}>
              {selectedFlock 
                ? t('recommendations.form.basedOnAge', { days: (selectedFlock.age || 0) * 7 }) 
                : t('recommendations.form.enterAge')}
            </small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="quantity_kg" className={styles.label}>
              {t('recommendations.form.quantity')} (kg) <span className={styles.required}>*</span>
            </label>
            <input
              type="number"
              id="quantity_kg"
              name="quantity_kg"
              value={formData.quantity_kg}
              onChange={handleChange}
              min="0.1"
              step="0.1"
              required
              disabled={!isOnline}
              className={styles.input}
            />
            <small className={styles.helpText}>{t('recommendations.form.quantityHint')}</small>
          </div>
        </div>

        {/* Weight Tracking Section */}
        <div className={styles.weightSection}>
          <h3 className={styles.sectionTitle}>{t('recommendations.form.weightTracking')} <span className={styles.optional}>({t('recommendations.form.optional')})</span></h3>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="current_weight_kg" className={styles.label}>
                {t('recommendations.form.currentWeight')} (kg)
              </label>
              <input
                type="number"
                id="current_weight_kg"
                name="current_weight_kg"
                value={formData.current_weight_kg}
                onChange={handleChange}
                min="0"
                step="0.01"
                disabled={!isOnline}
                className={styles.input}
                placeholder="0.00"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="target_weight_kg" className={styles.label}>
                {t('recommendations.form.targetWeight')} (kg)
              </label>
              <input
                type="number"
                id="target_weight_kg"
                name="target_weight_kg"
                value={formData.target_weight_kg}
                onChange={handleChange}
                min="0"
                step="0.01"
                disabled={!isOnline}
                className={styles.input}
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {/* Submit Section */}
        <div className={styles.submitSection}>
          <button 
            type="submit" 
            disabled={!canSubmit}
            className={`${styles.submitButton} ${!canSubmit ? styles.disabled : ''}`}
          >
            {!isOnline ? '📴 ' + t('recommendations.form.goOnline') : 
             loading ? (
               <>
                 <span className={styles.buttonSpinner}></span>
                 {t('recommendations.form.generating')}
               </>
             ) : (
               <>
                 ✨ {t('recommendations.form.generateAI')}
               </>
             )}
          </button>
          
          {!isOnline && (
            <div className={styles.offlineWarning}>
              <strong>⚠️ {t('recommendations.form.aiUnavailable')}</strong>
              <p>{t('recommendations.form.goOnlineMessage')}</p>
            </div>
          )}
          
          {flocks.length === 0 && (
            <div className={styles.noFlocksWarning}>
              {t('recommendations.form.needFlockWarning')}
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default RecommendationForm;