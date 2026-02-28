import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { recommendationService } from '../../services/recommendations';
import RecommendationResult from './RecommendationResult';
import styles from './RecommendationDetail.module.css';

const RecommendationDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    console.log('🔍 RecommendationDetail mounted with ID:', id);
    fetchRecommendation();
  }, [id]);

  const fetchRecommendation = async () => {
    try {
      if (!refreshing) setLoading(true);
      setError('');
      console.log('📡 Fetching recommendation details for ID:', id);
      
      if (!id || id === 'undefined' || id === 'null') {
        throw new Error(t('recommendations.detail.notFoundText'));
      }
      
      const data = await recommendationService.getRecommendation(id);
      console.log('✅ Recommendation data loaded:', data);
      
      if (!data) {
        throw new Error(t('recommendations.detail.notFoundText'));
      }
      
      setRecommendation(data);
    } catch (err) {
      console.error('❌ Error in fetchRecommendation:', err);
      setError(`${t('recommendations.detail.error')}: ${err.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleGoBack = () => navigate('/recommendations');
  
  const handleRefresh = () => {
    console.log('🔄 Refreshing recommendation data...');
    setRefreshing(true);
    fetchRecommendation();
  };

  const formatCreatedDate = () => {
    try {
      if (recommendation?.created_at) {
        const date = new Date(recommendation.created_at);
        return date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch (e) {
      console.warn('Error formatting date:', e);
    }
    return t('recommendations.detail.created');
  };

  // Loading State
  if (loading && !refreshing) {
    return (
      <div className={styles.container}>
        <div className={styles.centerCard}>
          <div className={styles.spinner}></div>
          <h3 className={styles.cardTitle}>{t('recommendations.detail.loading')}</h3>
          <p className={styles.cardText}>{t('recommendations.detail.loadingText')}</p>
          <p className={styles.idBadge}>{t('recommendations.detail.id')}: {id}</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.centerCard}>
          <div className={styles.errorIcon}>⚠️</div>
          <h3 className={styles.cardTitle}>{t('recommendations.detail.error')}</h3>
          <p className={styles.errorMessage}>{error}</p>
          <div className={styles.buttonGroup}>
            <button 
              onClick={handleRefresh} 
              className={styles.primaryButton} 
              disabled={refreshing}
            >
              {refreshing ? t('common.loading') : t('recommendations.detail.tryAgain')}
            </button>
            <button onClick={handleGoBack} className={styles.secondaryButton}>
              {t('recommendations.detail.backToList')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Not Found State
  if (!recommendation) {
    return (
      <div className={styles.container}>
        <div className={styles.centerCard}>
          <div className={styles.notFoundIcon}>🔍</div>
          <h3 className={styles.cardTitle}>{t('recommendations.detail.notFound')}</h3>
          <p className={styles.cardText}>{t('recommendations.detail.notFoundText')}</p>
          <p className={styles.cardText}>{t('recommendations.detail.notFoundText2')}</p>
          <button onClick={handleGoBack} className={styles.primaryButton}>
            {t('recommendations.detail.backToList')}
          </button>
        </div>
      </div>
    );
  }

  // Main Content
  return (
    <div className={styles.container}>
      {/* Header Section */}
      <header className={styles.header}>
        <button onClick={handleGoBack} className={styles.backButton}>
          <span className={styles.backArrow}>←</span>
          {t('common.back')}
        </button>
        
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>{t('recommendations.detail.title')}</h1>
          <div className={styles.headerMeta}>
            <span className={styles.idBadge}>
              {t('recommendations.detail.id')}: {id}
            </span>
            <span className={styles.dateBadge}>
              {t('recommendations.detail.created')}: {formatCreatedDate()}
            </span>
          </div>
        </div>

        <button 
          onClick={handleRefresh} 
          className={styles.refreshButton}
          disabled={refreshing}
          aria-label="Refresh"
        >
          <span className={refreshing ? styles.refreshIconSpin : styles.refreshIcon}>🔄</span>
          {t('common.refresh')}
        </button>
      </header>

      {/* Stats Section */}
      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>{t('recommendations.detail.status')}</span>
          <span className={`${styles.statValue} ${styles[recommendation.status?.toLowerCase() || 'completed']}`}>
            {recommendation.status || t('recommendations.status.completed')}
          </span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>{t('recommendations.detail.flock')}</span>
          <span className={styles.statValue}>{recommendation.flock_name || 'Unknown'}</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>{t('recommendations.detail.ingredients')}</span>
          <span className={styles.statValue}>
            {recommendation.ingredients?.length || 0} {t('recommendations.detail.items')}
          </span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>{t('recommendations.detail.totalCost')}</span>
          <span className={styles.statValue}>
            UGX {recommendation.total_cost ? recommendation.total_cost.toLocaleString() : 'Calculating...'}
          </span>
        </div>
      </section>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <RecommendationResult recommendation={recommendation} />
      </main>

      {/* Footer Actions */}
      <footer className={styles.footerActions}>
        <button 
          onClick={() => navigate(`/recommendations/new?flock=${recommendation.flock_id}`)}
          className={styles.secondaryButton}
        >
          {t('recommendations.detail.newForSameFlock')}
        </button>
        <button 
          onClick={() => window.print()}
          className={styles.outlineButton}
        >
          🖨️ {t('recommendations.detail.printReport')}
        </button>
      </footer>
    </div>
  );
};

export default RecommendationDetail;