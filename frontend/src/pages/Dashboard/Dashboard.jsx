// frontend/src/pages/Dashboard/Dashboard.jsx - COMPLETE RESTRUCTURED VERSION
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { flockService } from '../../services/flocks';
import { recommendationService } from '../../services/recommendations';
import apiClient from '../../services/api/client';
import styles from './Dashboard.module.css';

// ==================== UTILITY FUNCTIONS ====================
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0
  }).format(amount);
};

const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return date.toLocaleDateString();
};

// ==================== COMPONENT: LOADING STATE ====================
const LoadingState = () => {
  const { t } = useTranslation();
  return (
    <div className={styles.container}>
      <div className={styles.loadingState}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>{t('common.loading')}</p>
      </div>
    </div>
  );
};

// ==================== COMPONENT: ERROR STATE ====================
const ErrorState = ({ error, onRetry }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.container}>
      <div className={styles.errorState}>
        <div className={styles.errorIcon}>⚠️</div>
        <h2 className={styles.errorTitle}>Oops! Something went wrong</h2>
        <p className={styles.errorMessage}>{error}</p>
        <button onClick={onRetry} className={styles.retryButton}>
          {t('common.tryAgain')}
        </button>
      </div>
    </div>
  );
};

// ==================== COMPONENT: DASHBOARD HEADER ====================
const DashboardHeader = () => {
  const { t } = useTranslation();
  return (
    <div className={styles.header}>
      <div className={styles.headerContent}>
        <h1 className={styles.title}>{t('dashboard.title')}</h1>
        <p className={styles.subtitle}>Welcome back! Here's what's happening with your flocks.</p>
      </div>
      <div className={styles.headerActions}>
        <Link to="/flocks/new" className={styles.primaryButton}>
          <span className={styles.buttonIcon}>+</span>
          {t('dashboard.addFlock')}
        </Link>
        <Link to="/recommendations/new" className={styles.secondaryButton}>
          <span className={styles.buttonIcon}>✨</span>
          {t('dashboard.generateRecommendation')}
        </Link>
      </div>
    </div>
  );
};

// ==================== COMPONENT: STAT CARD ====================
const StatCard = ({ icon, color, title, value, subtext, linkTo, linkText, onClick }) => {
  return (
    <div className={styles.statCard}>
      <div className={styles.statIcon} style={{ backgroundColor: color }}>
        {icon}
      </div>
      <div className={styles.statContent}>
        <h3 className={styles.statTitle}>{title}</h3>
        <p className={styles.statNumber}>{value}</p>
        <p className={styles.statSubtext}>{subtext}</p>
      </div>
      {onClick ? (
        <button onClick={onClick} className={styles.statLink}>
          {linkText} →
        </button>
      ) : (
        <Link to={linkTo} className={styles.statLink}>
          {linkText} →
        </Link>
      )}
    </div>
  );
};

// ==================== COMPONENT: STATS GRID ====================
const StatsGrid = ({ stats, dashboardData, onRefresh }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.statsGrid}>
      <StatCard
        icon="🐔"
        color="#2E7D32"
        title={t('dashboard.totalFlocks')}
        value={stats.flockCount}
        subtext={`${stats.activeFlocks} ${t('common.active')} • ${stats.totalBirds} ${t('common.totalBirds')}`}
        linkTo="/flocks"
        linkText={t('common.viewAll')}
      />
      <StatCard
        icon="📊"
        color="#FF9800"
        title={t('dashboard.feedRecommendations')}
        value={stats.recommendationCount}
        subtext={`${dashboardData?.summary?.recent_recommendations || dashboardData?.recommendations?.length || 0} ${t('common.recent')}`}
        linkTo="/recommendations"
        linkText={t('common.viewAll')}
      />
      <StatCard
        icon="💰"
        color="#2196F3"
        title={t('dashboard.estimatedSavings')}
        value={formatCurrency(stats.estimatedSavings)}
        subtext={t('dashboard.fromRecommendations', { count: stats.recommendationCount })}
        linkTo="/recommendations"
        linkText={t('common.details')}
      />
      <StatCard
        icon="📈"
        color="#9C27B0"
        title={t('dashboard.systemHealth')}
        value={dashboardData?.health_status?.overall_status || t('common.checking')}
        subtext={dashboardData?.health_status?.flock_health || t('common.noData')}
        onClick={onRefresh}
        linkText={t('common.refresh')}
      />
    </div>
  );
};

// ==================== COMPONENT: RECENT FLOCKS ====================
const RecentFlocks = ({ flocks }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.contentCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>{t('dashboard.recentFlocks')}</h3>
        <Link to="/flocks" className={styles.viewAllLink}>
          {t('common.viewAll')}
        </Link>
      </div>
      {flocks && flocks.length > 0 ? (
        <div className={styles.list}>
          {flocks.map((flock, index) => (
            <div key={flock.id || index} className={styles.listItem}>
              <div className={styles.listItemIcon}>🐔</div>
              <div className={styles.listItemMain}>
                <span className={styles.listItemTitle}>{flock.name}</span>
                <span className={styles.listItemSubtitle}>
                  {flock.bird_type} • {flock.quantity} {t('common.birds')} • {flock.age || 0} {t('common.weeks')}
                </span>
              </div>
              <Link to={`/flocks/${flock.id}`} className={styles.listItemAction}>
                {t('common.view')}
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>🐣</div>
          <p className={styles.emptyStateText}>{t('dashboard.noFlocks')}</p>
          <Link to="/flocks/new" className={styles.emptyStateButton}>
            {t('dashboard.createFirstFlock')}
          </Link>
        </div>
      )}
    </div>
  );
};

// ==================== COMPONENT: RECENT RECOMMENDATIONS ====================
const RecentRecommendations = ({ recommendations }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.contentCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>{t('dashboard.recentRecommendations')}</h3>
        <Link to="/recommendations" className={styles.viewAllLink}>
          {t('common.viewAll')}
        </Link>
      </div>
      {recommendations && recommendations.length > 0 ? (
        <div className={styles.list}>
          {recommendations.map((rec, index) => (
            <div key={rec.id || index} className={styles.listItem}>
              <div className={styles.listItemIcon}>📊</div>
              <div className={styles.listItemMain}>
                <span className={styles.listItemTitle}>{rec.flock_name}</span>
                <span className={styles.listItemSubtitle}>
                  {t('common.cost')}: {formatCurrency(rec.total_cost)} • {t('common.status')}: {rec.status}
                </span>
              </div>
              <Link to={`/recommendations/${rec.id}`} className={styles.listItemAction}>
                {t('common.view')}
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>🤖</div>
          <p className={styles.emptyStateText}>{t('dashboard.noRecommendations')}</p>
          <Link to="/recommendations/new" className={styles.emptyStateButton}>
            {t('dashboard.generateFirstRecommendation')}
          </Link>
        </div>
      )}
    </div>
  );
};

// ==================== COMPONENT: RECENT ACTIVITY ====================
const activityIcons = {
  login: '🔐',
  dashboard_view: '📊',
  flock_updated: '🐔',
  recommendation_created: '📈',
  default: '📝'
};

const RecentActivity = ({ activities }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.contentCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>{t('dashboard.recentActivity')}</h3>
      </div>
      {activities && activities.length > 0 ? (
        <div className={styles.activityList}>
          {activities.map((activity, index) => (
            <div key={index} className={styles.activityItem}>
              <div className={styles.activityIcon}>
                {activityIcons[activity.action] || activityIcons.default}
              </div>
              <div className={styles.activityContent}>
                <p className={styles.activityDescription}>{activity.description}</p>
                <span className={styles.activityTime}>
                  {formatRelativeTime(activity.created_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>📝</div>
          <p className={styles.emptyStateText}>{t('dashboard.noActivity')}</p>
        </div>
      )}
    </div>
  );
};

// ==================== COMPONENT: QUICK ACTIONS ====================
const QuickActions = ({ onRefresh }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.contentCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>{t('dashboard.quickActions')}</h3>
      </div>
      <div className={styles.quickActions}>
        <Link to="/flocks/new" className={styles.quickActionButton}>
          <span className={styles.quickActionIcon}>➕</span>
          <span className={styles.quickActionText}>{t('dashboard.addNewFlock')}</span>
        </Link>
        <Link to="/recommendations/new" className={styles.quickActionButton}>
          <span className={styles.quickActionIcon}>🤖</span>
          <span className={styles.quickActionText}>{t('dashboard.aiRecommendation')}</span>
        </Link>
        <Link to="/progress" className={styles.quickActionButton}>
          <span className={styles.quickActionIcon}>📈</span>
          <span className={styles.quickActionText}>{t('dashboard.viewProgress')}</span>
        </Link>
        <button onClick={onRefresh} className={styles.quickActionButton}>
          <span className={styles.quickActionIcon}>🔄</span>
          <span className={styles.quickActionText}>{t('dashboard.refreshData')}</span>
        </button>
      </div>
    </div>
  );
};

// ==================== CUSTOM HOOK: USE DASHBOARD DATA ====================
const useDashboardData = () => {
  const { t } = useTranslation();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    flockCount: 0,
    recommendationCount: 0,
    estimatedSavings: 0,
    totalBirds: 0,
    activeFlocks: 0
  });

  const fetchDirectData = useCallback(async () => {
    console.log('Fetching data directly from Firestore...');
    
    const flocks = await flockService.getFlocks();
    const flockCount = flocks.length;
    const totalBirds = flocks.reduce((sum, flock) => sum + (flock.quantity || 0), 0);
    
    const activeFlocks = flocks.filter(flock => {
      const updatedAt = flock.updatedAt || flock.createdAt;
      if (!updatedAt) return false;
      const updateDate = new Date(updatedAt);
      const daysSinceUpdate = (Date.now() - updateDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceUpdate <= 30;
    }).length;
    
    const recommendations = await recommendationService.getRecommendations();
    const recommendationCount = recommendations.length;
    
    const totalCost = recommendations.reduce((sum, rec) => {
      const cost = rec.total_cost || rec.totalCost || 0;
      return sum + cost;
    }, 0);
    const estimatedSavings = Math.round(totalCost * 0.15);
    
    setStats({
      flockCount,
      recommendationCount,
      estimatedSavings,
      totalBirds,
      activeFlocks
    });
    
    setDashboardData({
      summary: {
        flock_count: flockCount,
        active_flocks: activeFlocks,
        total_birds: totalBirds,
        recommendation_count: recommendationCount,
        recent_recommendations: recommendations.slice(0, 3).length,
        estimated_savings: estimatedSavings,
        total_cost_incurred: totalCost,
        currency: 'UGX'
      },
      flocks: flocks.slice(0, 3).map(flock => ({
        id: flock.id,
        name: flock.name,
        bird_type: flock.birdType || flock.bird_type,
        quantity: flock.quantity,
        age: flock.age
      })),
      recommendations: recommendations.slice(0, 3).map(rec => ({
        id: rec.id,
        flock_name: rec.flock_name || rec.flockName,
        total_cost: rec.total_cost || rec.totalCost || 0,
        created_at: rec.created_at || rec.createdAt,
        status: rec.status
      })),
      recent_activity: [
        {
          action: 'dashboard_view',
          description: t('dashboard.recentActivity'),
          created_at: new Date().toISOString()
        },
        ...(flockCount > 0 ? [{
          action: 'flock_updated',
          description: t('dashboard.flockUpdated', { name: flocks[0]?.name || t('common.flock') }),
          created_at: flocks[0]?.updatedAt || new Date().toISOString()
        }] : []),
        ...(recommendationCount > 0 ? [{
          action: 'recommendation_created',
          description: t('dashboard.recommendationCreated'),
          created_at: recommendations[0]?.created_at || new Date().toISOString()
        }] : [])
      ],
      health_status: {
        flock_health: flockCount > 0 ? t('common.good') : t('common.noData'),
        recommendation_rate: recommendationCount > 0 ? t('common.active') : t('common.inactive'),
        overall_status: flockCount > 0 && recommendationCount > 0 ? t('common.healthy') : t('common.needsAttention')
      }
    });
  }, [t]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      try {
        const response = await apiClient.get('/api/v1/analytics/dashboard');
        
        if (response.success && response.data) {
          const data = response.data;
          setDashboardData(data);
          
          setStats({
            flockCount: data.summary?.flockCount || 0,
            recommendationCount: data.summary?.recommendationCount || 0,
            estimatedSavings: data.summary?.estimatedSavings || 0,
            totalBirds: data.summary?.totalBirds || 0,
            activeFlocks: data.flocks?.length || 0
          });
        } else {
          await fetchDirectData();
        }
      } catch (apiError) {
        console.warn('API fetch failed, trying direct Firestore queries...', apiError);
        await fetchDirectData();
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(t('errors.general'));
    } finally {
      setLoading(false);
    }
  }, [t, fetchDirectData]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    dashboardData,
    stats,
    loading,
    error,
    refetch: fetchDashboardData
  };
};

// ==================== MAIN DASHBOARD COMPONENT ====================
const Dashboard = () => {
  const { dashboardData, stats, loading, error, refetch } = useDashboardData();

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  return (
    <div className={styles.container}>
      <DashboardHeader />
      
      <StatsGrid 
        stats={stats} 
        dashboardData={dashboardData}
        onRefresh={refetch}
      />

      <div className={styles.contentGrid}>
        <RecentFlocks flocks={dashboardData?.flocks} />
        <RecentRecommendations recommendations={dashboardData?.recommendations} />
        <RecentActivity activities={dashboardData?.recent_activity} />
        <QuickActions onRefresh={refetch} />
      </div>
    </div>
  );
};

export default Dashboard;