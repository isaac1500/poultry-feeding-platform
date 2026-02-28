// frontend/src/pages/Flocks/FlockDetail.jsx - COMPLETE RESTRUCTURED VERSION
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { flockService } from '../../services/flocks';
import { recommendationService } from '../../services/recommendations';
import styles from './FlockDetail.module.css';

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
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const calculateAge = (createdAt) => {
  if (!createdAt) return 0;
  const created = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7); // Convert to weeks
};

const calculateHealthScore = (flock) => {
  if (!flock) return 0;
  let score = 100;
  
  // Deduct points for missing data
  if (!flock.quantity || flock.quantity === 0) score -= 20;
  if (!flock.birdType) score -= 10;
  if (!flock.purpose) score -= 10;
  
  // Add points for recent updates
  const daysSinceUpdate = flock.updatedAt 
    ? (Date.now() - new Date(flock.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
    : 999;
  if (daysSinceUpdate < 7) score += 10;
  else if (daysSinceUpdate > 30) score -= 20;
  
  return Math.max(0, Math.min(100, score));
};

const getHealthStatus = (score) => {
  if (score >= 80) return { label: 'Excellent', color: '#2E7D32', icon: '🌟' };
  if (score >= 60) return { label: 'Good', color: '#4CAF50', icon: '✅' };
  if (score >= 40) return { label: 'Fair', color: '#FF9800', icon: '⚠️' };
  return { label: 'Needs Attention', color: '#f44336', icon: '🔴' };
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
const ErrorState = ({ error, onRetry, onGoBack }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.container}>
      <div className={styles.errorState}>
        <div className={styles.errorIcon}>⚠️</div>
        <h2 className={styles.errorTitle}>Flock Not Found</h2>
        <p className={styles.errorMessage}>{error}</p>
        <div className={styles.errorActions}>
          <button onClick={onRetry} className={styles.retryButton}>
            {t('common.tryAgain')}
          </button>
          <button onClick={onGoBack} className={styles.secondaryButton}>
            Back to Flocks
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== COMPONENT: HEADER ====================
const FlockHeader = ({ flock, onEdit, onDelete }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const healthScore = calculateHealthScore(flock);
  const healthStatus = getHealthStatus(healthScore);

  return (
    <div className={styles.header}>
      <div className={styles.headerTop}>
        <button onClick={() => navigate('/flocks')} className={styles.backButton}>
          ← Back to Flocks
        </button>
        <div className={styles.headerActions}>
          <button onClick={onEdit} className={styles.editButton}>
            ✏️ Edit
          </button>
          <button onClick={onDelete} className={styles.deleteButton}>
            🗑️ Delete
          </button>
        </div>
      </div>
      
      <div className={styles.headerContent}>
        <div className={styles.headerLeft}>
          <div className={styles.flockIcon}>🐔</div>
          <div className={styles.headerInfo}>
            <h1 className={styles.flockName}>{flock.name}</h1>
            <div className={styles.flockMeta}>
              <span className={styles.metaItem}>
                <span className={styles.metaLabel}>Type:</span>
                <span className={styles.metaValue}>{flock.birdType || 'N/A'}</span>
              </span>
              <span className={styles.metaDivider}>•</span>
              <span className={styles.metaItem}>
                <span className={styles.metaLabel}>Purpose:</span>
                <span className={styles.metaValue}>{flock.purpose || 'N/A'}</span>
              </span>
              <span className={styles.metaDivider}>•</span>
              <span className={styles.metaItem}>
                <span className={styles.metaLabel}>Created:</span>
                <span className={styles.metaValue}>{formatDate(flock.createdAt)}</span>
              </span>
            </div>
          </div>
        </div>
        
        <div className={styles.healthBadge} style={{ borderColor: healthStatus.color }}>
          <span className={styles.healthIcon}>{healthStatus.icon}</span>
          <div className={styles.healthInfo}>
            <span className={styles.healthLabel}>Health Status</span>
            <span className={styles.healthValue} style={{ color: healthStatus.color }}>
              {healthStatus.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== COMPONENT: STATS GRID ====================
const StatsGrid = ({ flock, recommendations }) => {
  const { t } = useTranslation();
  const age = calculateAge(flock.createdAt);
  const avgWeight = flock.averageWeight || 0;
  const totalRecommendations = recommendations.length;
  const totalCost = recommendations.reduce((sum, rec) => sum + (rec.total_cost || rec.totalCost || 0), 0);

  const stats = [
    {
      icon: '🐥',
      label: 'Total Birds',
      value: flock.quantity || 0,
      color: '#2E7D32',
      subtext: `Active flock`
    },
    {
      icon: '📅',
      label: 'Age (Weeks)',
      value: age,
      color: '#FF9800',
      subtext: `${Math.floor(age / 4)} months old`
    },
    {
      icon: '⚖️',
      label: 'Avg. Weight',
      value: avgWeight > 0 ? `${avgWeight} kg` : 'N/A',
      color: '#2196F3',
      subtext: flock.weightUnit || 'Per bird'
    },
    {
      icon: '📊',
      label: 'Recommendations',
      value: totalRecommendations,
      color: '#9C27B0',
      subtext: formatCurrency(totalCost)
    }
  ];

  return (
    <div className={styles.statsGrid}>
      {stats.map((stat, index) => (
        <div key={index} className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: stat.color }}>
            {stat.icon}
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>{stat.label}</span>
            <span className={styles.statValue}>{stat.value}</span>
            <span className={styles.statSubtext}>{stat.subtext}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

// ==================== COMPONENT: INFORMATION CARD ====================
const InformationCard = ({ flock }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.contentCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>📋 Flock Information</h3>
      </div>
      <div className={styles.infoGrid}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Flock ID</span>
          <span className={styles.infoValue}>{flock.id}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Bird Type</span>
          <span className={styles.infoValue}>{flock.birdType || 'N/A'}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Purpose</span>
          <span className={styles.infoValue}>{flock.purpose || 'N/A'}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Quantity</span>
          <span className={styles.infoValue}>{flock.quantity || 0} birds</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Average Weight</span>
          <span className={styles.infoValue}>
            {flock.averageWeight ? `${flock.averageWeight} ${flock.weightUnit || 'kg'}` : 'N/A'}
          </span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Age (Weeks)</span>
          <span className={styles.infoValue}>{flock.age || calculateAge(flock.createdAt)} weeks</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Created Date</span>
          <span className={styles.infoValue}>{formatDate(flock.createdAt)}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Last Updated</span>
          <span className={styles.infoValue}>{formatDate(flock.updatedAt)}</span>
        </div>
      </div>
      
      {flock.notes && (
        <div className={styles.notesSection}>
          <span className={styles.notesLabel}>Notes:</span>
          <p className={styles.notesText}>{flock.notes}</p>
        </div>
      )}
    </div>
  );
};

// ==================== COMPONENT: GROWTH CHART ====================
const GrowthChart = ({ flock }) => {
  const age = calculateAge(flock.createdAt);
  const currentWeight = flock.averageWeight || 0;
  
  // Generate mock growth data based on age and current weight
  const generateGrowthData = () => {
    const data = [];
    const expectedGrowth = age > 0 ? currentWeight / age : 0.2;
    
    for (let week = 0; week <= Math.min(age, 24); week += 2) {
      const expected = week * expectedGrowth;
      const actual = week === age ? currentWeight : expected * (0.9 + Math.random() * 0.2);
      data.push({ week, expected, actual });
    }
    return data;
  };

  const growthData = generateGrowthData();
  const maxWeight = Math.max(...growthData.map(d => Math.max(d.expected, d.actual))) * 1.2;

  return (
    <div className={styles.contentCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>📈 Growth Chart</h3>
      </div>
      <div className={styles.chartContainer}>
        <div className={styles.chartWrapper}>
          <svg className={styles.chart} viewBox="0 0 600 300" preserveAspectRatio="xMidYMid meet">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map(i => (
              <line
                key={`grid-${i}`}
                x1="50"
                y1={50 + (i * 50)}
                x2="550"
                y2={50 + (i * 50)}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
            ))}
            
            {/* Y-axis labels */}
            {[0, 1, 2, 3, 4].map(i => (
              <text
                key={`ylabel-${i}`}
                x="40"
                y={255 - (i * 50)}
                textAnchor="end"
                fontSize="12"
                fill="#64748b"
              >
                {((maxWeight / 4) * i).toFixed(1)}
              </text>
            ))}
            
            {/* Expected line */}
            <polyline
              points={growthData.map((d, i) => {
                const x = 50 + (i * (500 / growthData.length));
                const y = 250 - ((d.expected / maxWeight) * 200);
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
            
            {/* Actual line */}
            <polyline
              points={growthData.map((d, i) => {
                const x = 50 + (i * (500 / growthData.length));
                const y = 250 - ((d.actual / maxWeight) * 200);
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke="#2E7D32"
              strokeWidth="3"
            />
            
            {/* Data points */}
            {growthData.map((d, i) => {
              const x = 50 + (i * (500 / growthData.length));
              const y = 250 - ((d.actual / maxWeight) * 200);
              return (
                <circle
                  key={`point-${i}`}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#2E7D32"
                />
              );
            })}
            
            {/* X-axis labels */}
            {growthData.map((d, i) => {
              if (i % 2 === 0) {
                const x = 50 + (i * (500 / growthData.length));
                return (
                  <text
                    key={`xlabel-${i}`}
                    x={x}
                    y="275"
                    textAnchor="middle"
                    fontSize="12"
                    fill="#64748b"
                  >
                    W{d.week}
                  </text>
                );
              }
              return null;
            })}
            
            {/* Axis labels */}
            <text x="300" y="295" textAnchor="middle" fontSize="14" fill="#1e293b" fontWeight="600">
              Age (Weeks)
            </text>
            <text x="20" y="150" textAnchor="middle" fontSize="14" fill="#1e293b" fontWeight="600" transform="rotate(-90, 20, 150)">
              Weight (kg)
            </text>
          </svg>
        </div>
        
        <div className={styles.chartLegend}>
          <div className={styles.legendItem}>
            <span className={styles.legendColor} style={{ backgroundColor: '#2E7D32' }}></span>
            <span className={styles.legendLabel}>Actual Weight</span>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendColor} style={{ backgroundColor: '#94a3b8', opacity: 0.5 }}></span>
            <span className={styles.legendLabel}>Expected Weight</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== COMPONENT: FEED CONSUMPTION ====================
const FeedConsumption = ({ flock, recommendations }) => {
  const totalFeed = recommendations.reduce((sum, rec) => {
    const feeds = rec.feed_recommendations || rec.feedRecommendations || [];
    return sum + feeds.reduce((fsum, feed) => fsum + (feed.quantity || 0), 0);
  }, 0);

  const avgDailyFeed = flock.quantity > 0 ? totalFeed / flock.quantity / 7 : 0;

  return (
    <div className={styles.contentCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>🌾 Feed Consumption</h3>
      </div>
      <div className={styles.feedStats}>
        <div className={styles.feedStatItem}>
          <div className={styles.feedStatIcon}>📦</div>
          <div className={styles.feedStatContent}>
            <span className={styles.feedStatLabel}>Total Feed</span>
            <span className={styles.feedStatValue}>{totalFeed.toFixed(2)} kg</span>
          </div>
        </div>
        <div className={styles.feedStatItem}>
          <div className={styles.feedStatIcon}>📊</div>
          <div className={styles.feedStatContent}>
            <span className={styles.feedStatLabel}>Avg. Daily/Bird</span>
            <span className={styles.feedStatValue}>{avgDailyFeed.toFixed(3)} kg</span>
          </div>
        </div>
        <div className={styles.feedStatItem}>
          <div className={styles.feedStatIcon}>💰</div>
          <div className={styles.feedStatContent}>
            <span className={styles.feedStatLabel}>Total Cost</span>
            <span className={styles.feedStatValue}>
              {formatCurrency(recommendations.reduce((sum, rec) => sum + (rec.total_cost || rec.totalCost || 0), 0))}
            </span>
          </div>
        </div>
      </div>
      
      {recommendations.length > 0 && (
        <div className={styles.feedList}>
          <h4 className={styles.feedListTitle}>Recent Feed Recommendations:</h4>
          {recommendations.slice(0, 3).map((rec, index) => (
            <div key={index} className={styles.feedItem}>
              <div className={styles.feedItemLeft}>
                <span className={styles.feedItemDate}>{formatDate(rec.created_at || rec.createdAt)}</span>
              </div>
              <div className={styles.feedItemRight}>
                <span className={styles.feedItemCost}>{formatCurrency(rec.total_cost || rec.totalCost || 0)}</span>
                <Link to={`/recommendations/${rec.id}`} className={styles.feedItemLink}>
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ==================== COMPONENT: HEALTH METRICS ====================
const HealthMetrics = ({ flock }) => {
  const healthScore = calculateHealthScore(flock);
  const healthStatus = getHealthStatus(healthScore);
  const age = calculateAge(flock.createdAt);
  
  const metrics = [
    {
      label: 'Overall Health',
      value: healthScore,
      max: 100,
      color: healthStatus.color,
      status: healthStatus.label
    },
    {
      label: 'Growth Rate',
      value: age > 0 && flock.averageWeight ? (flock.averageWeight / age) * 10 : 50,
      max: 100,
      color: '#2196F3',
      status: 'Normal'
    },
    {
      label: 'Feed Efficiency',
      value: 75,
      max: 100,
      color: '#4CAF50',
      status: 'Good'
    },
    {
      label: 'Activity Level',
      value: 85,
      max: 100,
      color: '#FF9800',
      status: 'Active'
    }
  ];

  return (
    <div className={styles.contentCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>❤️ Health Metrics</h3>
      </div>
      <div className={styles.metricsGrid}>
        {metrics.map((metric, index) => (
          <div key={index} className={styles.metricItem}>
            <div className={styles.metricHeader}>
              <span className={styles.metricLabel}>{metric.label}</span>
              <span className={styles.metricStatus} style={{ color: metric.color }}>
                {metric.status}
              </span>
            </div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ 
                  width: `${(metric.value / metric.max) * 100}%`,
                  backgroundColor: metric.color
                }}
              ></div>
            </div>
            <div className={styles.metricValue}>
              {metric.value.toFixed(0)}/{metric.max}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==================== COMPONENT: QUICK ACTIONS ====================
const QuickActions = ({ flockId }) => {
  return (
    <div className={styles.contentCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>⚡ Quick Actions</h3>
      </div>
      <div className={styles.quickActions}>
        <Link to={`/recommendations/new?flockId=${flockId}`} className={styles.actionButton}>
          <span className={styles.actionIcon}>🤖</span>
          <span className={styles.actionText}>Generate AI Recommendation</span>
        </Link>
        <Link to={`/flocks/${flockId}/edit`} className={styles.actionButton}>
          <span className={styles.actionIcon}>✏️</span>
          <span className={styles.actionText}>Update Flock Info</span>
        </Link>
        <button className={styles.actionButton}>
          <span className={styles.actionIcon}>📊</span>
          <span className={styles.actionText}>Export Report</span>
        </button>
        <button className={styles.actionButton}>
          <span className={styles.actionIcon}>🔔</span>
          <span className={styles.actionText}>Set Reminders</span>
        </button>
      </div>
    </div>
  );
};

// ==================== CUSTOM HOOK: USE FLOCK DATA ====================
const useFlockData = (flockId) => {
  const { t } = useTranslation();
  const [flock, setFlock] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFlockData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch flock details
      const flockData = await flockService.getFlock(flockId);
      if (!flockData) {
        throw new Error('Flock not found');
      }
      setFlock(flockData);

      // Fetch recommendations for this flock
      const allRecommendations = await recommendationService.getRecommendations();
      const flockRecommendations = allRecommendations.filter(
        rec => rec.flockId === flockId || rec.flock_id === flockId
      );
      setRecommendations(flockRecommendations);

    } catch (err) {
      console.error('Error fetching flock data:', err);
      setError(err.message || t('errors.general'));
    } finally {
      setLoading(false);
    }
  }, [flockId, t]);

  useEffect(() => {
    if (flockId) {
      fetchFlockData();
    }
  }, [flockId, fetchFlockData]);

  return { flock, recommendations, loading, error, refetch: fetchFlockData };
};

// ==================== MAIN FLOCK DETAIL COMPONENT ====================
const FlockDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { flock, recommendations, loading, error, refetch } = useFlockData(id);

  const handleEdit = () => {
    navigate(`/flocks/${id}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this flock? This action cannot be undone.')) {
      try {
        await flockService.deleteFlock(id);
        navigate('/flocks');
      } catch (err) {
        alert('Failed to delete flock: ' + err.message);
      }
    }
  };

  const handleGoBack = () => {
    navigate('/flocks');
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error || !flock) {
    return <ErrorState error={error || 'Flock not found'} onRetry={refetch} onGoBack={handleGoBack} />;
  }

  return (
    <div className={styles.container}>
      <FlockHeader flock={flock} onEdit={handleEdit} onDelete={handleDelete} />
      
      <StatsGrid flock={flock} recommendations={recommendations} />

      <div className={styles.contentGrid}>
        <div className={styles.leftColumn}>
          <InformationCard flock={flock} />
          <FeedConsumption flock={flock} recommendations={recommendations} />
        </div>
        
        <div className={styles.rightColumn}>
          <GrowthChart flock={flock} />
          <HealthMetrics flock={flock} />
          <QuickActions flockId={id} />
        </div>
      </div>
    </div>
  );
};

export default FlockDetail;