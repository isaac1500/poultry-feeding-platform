// frontend/src/pages/Recommendations/RecommendationList.jsx - COMPLETE RESTRUCTURED VERSION
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { recommendationService } from '../../services/recommendations';
import { flockService } from '../../services/flocks';
import styles from './RecommendationList.module.css';

// ==================== UTILITY FUNCTIONS ====================
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return format(new Date(dateString), 'MMM dd, yyyy');
  } catch (err) {
    return 'N/A';
  }
};

const formatRelativeTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return formatDate(dateString);
};

const getStatusConfig = (status) => {
  const statusLower = status?.toLowerCase() || 'pending';
  const configs = {
    completed: { 
      color: '#27ae60', 
      bgColor: '#d4edda', 
      icon: '✓',
      label: 'Completed'
    },
    processing: { 
      color: '#f39c12', 
      bgColor: '#fff3cd', 
      icon: '⏳',
      label: 'Processing'
    },
    failed: { 
      color: '#e74c3c', 
      bgColor: '#f8d7da', 
      icon: '✗',
      label: 'Failed'
    },
    pending: { 
      color: '#3498db', 
      bgColor: '#d1ecf1', 
      icon: '○',
      label: 'Pending'
    },
    active: { 
      color: '#2E7D32', 
      bgColor: '#d4edda', 
      icon: '●',
      label: 'Active'
    }
  };
  return configs[statusLower] || configs.pending;
};

// ==================== COMPONENT: LOADING STATE ====================
const LoadingState = () => {
  const { t } = useTranslation();
  return (
    <div className={styles.loadingState}>
      <div className={styles.spinner}></div>
      <p className={styles.loadingText}>{t('common.loading')}</p>
    </div>
  );
};

// ==================== COMPONENT: ERROR STATE ====================
const ErrorState = ({ error, onRetry }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.errorState}>
      <div className={styles.errorIcon}>⚠️</div>
      <h3 className={styles.errorTitle}>Something went wrong</h3>
      <p className={styles.errorMessage}>{error}</p>
      <button onClick={onRetry} className={styles.retryButton}>
        {t('common.tryAgain')}
      </button>
    </div>
  );
};

// ==================== COMPONENT: EMPTY STATE ====================
const EmptyState = () => {
  const { t } = useTranslation();
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>📊</div>
      <h3 className={styles.emptyTitle}>{t('recommendations.list.noRecommendations')}</h3>
      <p className={styles.emptyText}>{t('recommendations.list.noRecommendationsText')}</p>
      <Link to="/recommendations/new" className={styles.emptyButton}>
        <span className={styles.buttonIcon}>✨</span>
        {t('recommendations.list.createFirst')}
      </Link>
    </div>
  );
};

// ==================== COMPONENT: HEADER ====================
const PageHeader = ({ totalCount, onRefresh }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.header}>
      <div className={styles.headerLeft}>
        <h1 className={styles.title}>{t('recommendations.list.title')}</h1>
        <span className={styles.subtitle}>{totalCount} total recommendations</span>
      </div>
      <div className={styles.headerActions}>
        <button onClick={onRefresh} className={styles.refreshButton}>
          <span className={styles.buttonIcon}>🔄</span>
          Refresh
        </button>
        <Link to="/recommendations/new" className={styles.newButton}>
          <span className={styles.buttonIcon}>+</span>
          {t('recommendations.new')}
        </Link>
      </div>
    </div>
  );
};

// ==================== COMPONENT: FILTERS ====================
const Filters = ({ filter, selectedFlock, flocks, onFilterChange, onFlockChange, stats }) => {
  const { t } = useTranslation();
  
  return (
    <div className={styles.filtersSection}>
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>
            <span className={styles.filterIcon}>🔍</span>
            {t('recommendations.list.filterBy')}
          </label>
          <select 
            value={filter} 
            onChange={(e) => onFilterChange(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">{t('recommendations.list.allRecommendations')}</option>
            <option value="recent">Recent (Last 5)</option>
            <option value="completed">Completed</option>
            <option value="processing">Processing</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>
            <span className={styles.filterIcon}>🐔</span>
            {t('recommendations.list.filterByFlock')}
          </label>
          <select 
            value={selectedFlock} 
            onChange={(e) => onFlockChange(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">{t('recommendations.list.allFlocks')}</option>
            {flocks.map(flock => (
              <option key={flock.id} value={flock.id}>{flock.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Overview */}
      <div className={styles.statsBar}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Total Cost:</span>
          <span className={styles.statValue}>{formatCurrency(stats.totalCost)}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Avg Cost:</span>
          <span className={styles.statValue}>{formatCurrency(stats.avgCost)}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Completed:</span>
          <span className={styles.statValue}>{stats.completed}</span>
        </div>
      </div>
    </div>
  );
};

// ==================== COMPONENT: RECOMMENDATION CARD ====================
const RecommendationCard = ({ recommendation, onDelete }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const statusConfig = getStatusConfig(recommendation.status);

  const handleCardClick = () => {
    navigate(`/recommendations/${recommendation.id}`);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete(recommendation.id);
  };

  return (
    <div className={styles.card} onClick={handleCardClick}>
      <div className={styles.cardHeader}>
        <div className={styles.cardHeaderLeft}>
          <div className={styles.cardIcon}>📊</div>
          <div className={styles.cardTitleSection}>
            <h3 className={styles.cardTitle}>{recommendation.flock_name || 'Unknown Flock'}</h3>
            <span className={styles.cardSubtitle}>{recommendation.feed_type || 'N/A'}</span>
          </div>
        </div>
        <div 
          className={styles.statusBadge}
          style={{ 
            backgroundColor: statusConfig.bgColor,
            color: statusConfig.color 
          }}
        >
          <span className={styles.statusIcon}>{statusConfig.icon}</span>
          {statusConfig.label}
        </div>
      </div>
      
      <div className={styles.cardBody}>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>💰</span>
            <div className={styles.infoContent}>
              <span className={styles.infoLabel}>{t('recommendations.list.totalCost')}</span>
              <span className={styles.infoValue}>
                {formatCurrency(recommendation.total_cost || 0)}
              </span>
            </div>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>📅</span>
            <div className={styles.infoContent}>
              <span className={styles.infoLabel}>{t('recommendations.list.created')}</span>
              <span className={styles.infoValue}>
                {formatDate(recommendation.created_at)}
              </span>
            </div>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>⏱️</span>
            <div className={styles.infoContent}>
              <span className={styles.infoLabel}>Last Updated</span>
              <span className={styles.infoValue}>
                {formatRelativeTime(recommendation.updated_at || recommendation.created_at)}
              </span>
            </div>
          </div>

          {recommendation.feed_recommendations && (
            <div className={styles.infoItem}>
              <span className={styles.infoIcon}>🌾</span>
              <div className={styles.infoContent}>
                <span className={styles.infoLabel}>Feed Items</span>
                <span className={styles.infoValue}>
                  {Array.isArray(recommendation.feed_recommendations) 
                    ? recommendation.feed_recommendations.length 
                    : 0} items
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.cardFooter}>
        <button className={styles.viewButton}>
          <span className={styles.buttonIcon}>👁️</span>
          {t('recommendations.list.viewDetails')}
        </button>
        <button 
          onClick={handleDeleteClick}
          className={styles.deleteButton}
        >
          <span className={styles.buttonIcon}>🗑️</span>
          {t('common.delete')}
        </button>
      </div>
    </div>
  );
};

// ==================== COMPONENT: RECOMMENDATIONS GRID ====================
const RecommendationsGrid = ({ recommendations, onDelete }) => {
  return (
    <div className={styles.grid}>
      {recommendations.map((rec) => (
        <RecommendationCard 
          key={rec.id} 
          recommendation={rec} 
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

// ==================== CUSTOM HOOK: USE RECOMMENDATIONS DATA ====================
const useRecommendationsData = () => {
  const { t } = useTranslation();
  const [recommendations, setRecommendations] = useState([]);
  const [flocks, setFlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedFlock, setSelectedFlock] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch recommendations
      const recData = await recommendationService.getRecommendations(selectedFlock || null);
      
      // Fetch flocks for filter
      const flocksData = await flockService.getFlocks();
      setFlocks(flocksData);

      // Apply filters
      let filteredData = recData;
      
      if (filter === 'recent') {
        filteredData = recData.slice(0, 5);
      } else if (filter !== 'all') {
        filteredData = recData.filter(rec => 
          rec.status?.toLowerCase() === filter.toLowerCase()
        );
      }
      
      setRecommendations(filteredData);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [filter, selectedFlock, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id) => {
    if (window.confirm(t('recommendations.list.deleteConfirm'))) {
      try {
        await recommendationService.deleteRecommendation(id);
        setRecommendations(prev => prev.filter(rec => rec.id !== id));
      } catch (err) {
        alert(t('common.error'));
      }
    }
  };

  const stats = {
    totalCost: recommendations.reduce((sum, rec) => sum + (rec.total_cost || 0), 0),
    avgCost: recommendations.length > 0 
      ? recommendations.reduce((sum, rec) => sum + (rec.total_cost || 0), 0) / recommendations.length 
      : 0,
    completed: recommendations.filter(rec => rec.status?.toLowerCase() === 'completed').length
  };

  return {
    recommendations,
    flocks,
    loading,
    error,
    filter,
    selectedFlock,
    stats,
    setFilter,
    setSelectedFlock,
    handleDelete,
    refetch: fetchData
  };
};

// ==================== MAIN RECOMMENDATION LIST COMPONENT ====================
const RecommendationList = () => {
  const {
    recommendations,
    flocks,
    loading,
    error,
    filter,
    selectedFlock,
    stats,
    setFilter,
    setSelectedFlock,
    handleDelete,
    refetch
  } = useRecommendationsData();

  if (loading) {
    return (
      <div className={styles.container}>
        <LoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <ErrorState error={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <PageHeader totalCount={recommendations.length} onRefresh={refetch} />
      
      <Filters 
        filter={filter}
        selectedFlock={selectedFlock}
        flocks={flocks}
        onFilterChange={setFilter}
        onFlockChange={setSelectedFlock}
        stats={stats}
      />

      {recommendations.length === 0 ? (
        <EmptyState />
      ) : (
        <RecommendationsGrid 
          recommendations={recommendations} 
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default RecommendationList;