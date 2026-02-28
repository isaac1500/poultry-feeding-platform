import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { flockService } from '../../services/flocks';
import { recommendationService } from '../../services/recommendations';
import apiClient from '../../services/api/client';
import styles from './Progress.module.css';

const CHART_COLORS = ['#667eea', '#764ba2', '#10b981', '#f59e0b', '#ef4444'];

const Progress = () => {
  const { t, i18n } = useTranslation();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFlock, setSelectedFlock] = useState('');
  const [timeRange, setTimeRange] = useState('30');
  
  const [stats, setStats] = useState({
    totalFlocks: 0,
    totalBirds: 0,
    totalCost: 0,
    totalSavings: 0,
    averageGrowth: 0,
    feedEfficiency: 0
  });
  
  const [flocks, setFlocks] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [growthData, setGrowthData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [ingredientData, setIngredientData] = useState([]);

  // Fetch data on mount and when filters change
  useEffect(() => {
    fetchProgressData();
  }, [selectedFlock, timeRange]);

  // Main data fetching function
  const fetchProgressData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Try API endpoint first
      try {
        const response = await apiClient.get('/progress/progress', {
          params: {
            flock_id: selectedFlock || undefined,
            time_range: timeRange
          }
        });
        
        if (response.success && response.data) {
          handleApiResponse(response.data);
          return;
        }
      } catch (apiError) {
        console.log('API fetch failed, falling back to direct queries...', apiError);
      }
      
      // Fallback to direct data fetch
      await fetchDirectData();
      
    } catch (err) {
      console.error('Error fetching progress data:', err);
      setError(t('progress.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [selectedFlock, timeRange, t]);

  // Handle API response
  const handleApiResponse = useCallback((data) => {
    setStats({
      totalFlocks: data.stats?.total_flocks || 0,
      totalBirds: data.stats?.total_birds || 0,
      totalCost: data.stats?.total_cost || 0,
      totalSavings: data.stats?.estimated_savings || 0,
      averageGrowth: data.stats?.average_growth || 0,
      feedEfficiency: data.stats?.feed_efficiency || 0
    });
    
    setFlocks(data.flocks || []);
    setRecommendations(data.recommendations || []);
    setGrowthData(data.growth_data || []);
    setMonthlyData(data.monthly_data || []);
    setIngredientData(data.cost_breakdown || []);
  }, []);

  // Fetch data directly from services
  const fetchDirectData = useCallback(async () => {
    const flocksData = await flockService.getFlocks();
    const recsData = await recommendationService.getRecommendations();
    
    setFlocks(flocksData.slice(0, 10));
    setRecommendations(recsData.slice(0, 10));
    
    // Calculate stats
    const totalFlocks = flocksData.length;
    const totalBirds = flocksData.reduce((sum, f) => sum + (f.quantity || 0), 0);
    const totalCost = recsData.reduce((sum, r) => sum + (r.total_cost || r.totalCost || 0), 0);
    const totalSavings = totalCost * 0.15;
    
    setStats({
      totalFlocks,
      totalBirds,
      totalCost,
      totalSavings,
      averageGrowth: totalBirds > 0 ? 85 : 0,
      feedEfficiency: totalCost > 0 ? 2.8 : 0
    });
    
    generateMockChartData();
  }, []);

  // Generate mock chart data
  const generateMockChartData = useCallback(() => {
    // Growth data
    const growth = Array.from({ length: 8 }, (_, i) => ({
      week: t('progress.charts.weekLabel', { week: i + 1 }),
      weight: 0.2 + ((i + 1) * 0.15),
      feed: 0.5 + ((i + 1) * 0.3),
      fcr: 1.5 + (Math.random() * 0.5)
    }));
    setGrowthData(growth);
    
    // Monthly data
    const months = [
      t('progress.charts.months.jan'),
      t('progress.charts.months.feb'),
      t('progress.charts.months.mar'),
      t('progress.charts.months.apr'),
      t('progress.charts.months.may'),
      t('progress.charts.months.jun')
    ];
    const monthly = months.map((month, index) => ({
      month,
      cost: 200000 + (index * 30000) + (Math.random() * 50000),
      savings: 30000 + (index * 5000) + (Math.random() * 15000),
      recommendations: 3 + Math.floor(Math.random() * 4)
    }));
    setMonthlyData(monthly);
    
    // Ingredient breakdown
    const ingredients = [
      { name: t('progress.ingredients.maize'), value: 45, cost: 67500 },
      { name: t('progress.ingredients.soya'), value: 30, cost: 84000 },
      { name: t('progress.ingredients.fishMeal'), value: 10, cost: 50000 },
      { name: t('progress.ingredients.premix'), value: 5, cost: 25000 },
      { name: t('progress.ingredients.wheatBran'), value: 10, cost: 30000 }
    ];
    setIngredientData(ingredients);
  }, [t]);

  // Utility functions
  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat(i18n.language === 'lg' ? 'en-UG' : 'en-US', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }, [i18n.language]);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return t('progress.na');
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(i18n.language === 'lg' ? 'en-US' : i18n.language, {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return t('progress.invalidDate');
    }
  }, [i18n.language, t]);

  // Loading state
  if (loading) {
    return <LoadingState t={t} />;
  }

  // Error state
  if (error && flocks.length === 0) {
    return <ErrorState error={error} onRetry={fetchProgressData} t={t} />;
  }

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <PageHeader 
        t={t} 
        i18n={i18n}
        flocks={flocks}
        selectedFlock={selectedFlock}
        setSelectedFlock={setSelectedFlock}
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        onRefresh={fetchProgressData}
        loading={loading}
      />

      {/* Stats Overview */}
      <StatsOverview stats={stats} formatCurrency={formatCurrency} t={t} />

      {/* Charts Section */}
      <ChartsSection 
        growthData={growthData}
        monthlyData={monthlyData}
        ingredientData={ingredientData}
        formatCurrency={formatCurrency}
        t={t}
      />

      {/* Data Tables */}
      <DataTables 
        flocks={flocks}
        recommendations={recommendations}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
        t={t}
      />

      {/* Insights & Actions */}
      <InsightsSection 
        stats={stats}
        formatCurrency={formatCurrency}
        t={t}
      />
    </div>
  );
};

// ==================== SUB-COMPONENTS ====================

// Language Switcher
const LanguageSwitcher = ({ i18n }) => (
  <div className={styles.languageSwitcher}>
    <button 
      className={`${styles.langBtn} ${i18n.language === 'en' ? styles.active : ''}`}
      onClick={() => i18n.changeLanguage('en')}
    >
      EN
    </button>
    <button 
      className={`${styles.langBtn} ${i18n.language === 'lg' ? styles.active : ''}`}
      onClick={() => i18n.changeLanguage('lg')}
    >
      LG
    </button>
  </div>
);

// Loading State Component
const LoadingState = ({ t }) => (
  <div className={styles.container}>
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}>
        <div className={styles.spinnerRing}></div>
        <div className={styles.spinnerRing}></div>
        <div className={styles.spinnerRing}></div>
      </div>
      <h2 className={styles.loadingTitle}>{t('progress.loading')}</h2>
      <p className={styles.loadingText}>{t('progress.loadingText')}</p>
    </div>
  </div>
);

// Error State Component
const ErrorState = ({ error, onRetry, t }) => (
  <div className={styles.container}>
    <div className={styles.errorContainer}>
      <div className={styles.errorIcon}>⚠️</div>
      <h2 className={styles.errorTitle}>{t('progress.errorTitle')}</h2>
      <p className={styles.errorText}>{error}</p>
      <button onClick={onRetry} className={styles.retryButton}>
        <span>🔄</span> {t('progress.tryAgain')}
      </button>
    </div>
  </div>
);

// Page Header Component
const PageHeader = ({ t, i18n, flocks, selectedFlock, setSelectedFlock, timeRange, setTimeRange, onRefresh, loading }) => (
  <header className={styles.header}>
    <div className={styles.headerTop}>
      <h1 className={styles.title}>{t('progress.title')}</h1>
      <LanguageSwitcher i18n={i18n} />
    </div>
    
    <div className={styles.controls}>
      <div className={styles.filterGroup}>
        <label>{t('progress.filterByFlock')}:</label>
        <select 
          value={selectedFlock} 
          onChange={(e) => setSelectedFlock(e.target.value)}
          className={styles.select}
        >
          <option value="">{t('progress.allFlocks')}</option>
          {flocks.map(flock => (
            <option key={flock.id} value={flock.id}>{flock.name}</option>
          ))}
        </select>
      </div>
      
      <div className={styles.filterGroup}>
        <label>{t('progress.timePeriod')}:</label>
        <select 
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value)}
          className={styles.select}
        >
          <option value="7">{t('progress.timeOptions.last7Days')}</option>
          <option value="30">{t('progress.timeOptions.last30Days')}</option>
          <option value="90">{t('progress.timeOptions.last90Days')}</option>
          <option value="365">{t('progress.timeOptions.lastYear')}</option>
        </select>
      </div>
      
      <button 
        onClick={onRefresh} 
        className={styles.refreshButton}
        disabled={loading}
      >
        {loading ? t('progress.refreshing') : `🔄 ${t('progress.refresh')}`}
      </button>
    </div>
  </header>
);

// Stats Overview Component
const StatsOverview = ({ stats, formatCurrency, t }) => {
  const statCards = [
    {
      icon: '🐔',
      color: '#10b981',
      title: t('progress.stats.totalFlocks'),
      number: stats.totalFlocks,
      subtext: t('progress.stats.birdCount', { count: stats.totalBirds })
    },
    {
      icon: '💰',
      color: '#f59e0b',
      title: t('progress.stats.totalInvestment'),
      number: formatCurrency(stats.totalCost),
      subtext: t('progress.stats.feedCosts')
    },
    {
      icon: '📈',
      color: '#3b82f6',
      title: t('progress.stats.totalSavings'),
      number: formatCurrency(stats.totalSavings),
      subtext: t('progress.stats.fromOptimization')
    },
    {
      icon: '⚡',
      color: '#8b5cf6',
      title: t('progress.stats.feedEfficiency'),
      number: stats.feedEfficiency,
      subtext: t('progress.stats.fcr')
    }
  ];

  return (
    <div className={styles.statsGrid}>
      {statCards.map((stat, index) => (
        <StatCard key={index} {...stat} index={index} />
      ))}
    </div>
  );
};

// Individual Stat Card
const StatCard = ({ icon, color, title, number, subtext, index }) => (
  <div className={styles.statCard} style={{ animationDelay: `${index * 0.1}s` }}>
    <div className={styles.statIcon} style={{ background: color }}>
      {icon}
    </div>
    <div className={styles.statContent}>
      <h3 className={styles.statTitle}>{title}</h3>
      <p className={styles.statNumber}>{number}</p>
      <p className={styles.statSubtext}>{subtext}</p>
    </div>
  </div>
);

// Charts Section Component
const ChartsSection = ({ growthData, monthlyData, ingredientData, formatCurrency, t }) => (
  <section className={styles.chartsSection}>
    <h2 className={styles.sectionTitle}>{t('progress.charts.title')}</h2>
    
    <div className={styles.chartsGrid}>
      <WeightGainChart data={growthData} t={t} />
      <MonthlyCostChart data={monthlyData} formatCurrency={formatCurrency} t={t} />
      <FeedConsumptionChart data={growthData} t={t} />
      <CostBreakdownChart data={ingredientData} formatCurrency={formatCurrency} t={t} />
    </div>
  </section>
);

// Weight Gain Chart
const WeightGainChart = ({ data, t }) => (
  <div className={styles.chartCard}>
    <h3 className={styles.chartTitle}>{t('progress.charts.weightGain')}</h3>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="week" stroke="#6b7280" />
        <YAxis stroke="#6b7280" />
        <Tooltip 
          formatter={(value) => [`${value} ${t('progress.charts.kg')}`, t('progress.charts.weight')]}
          contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="weight" 
          stroke="#667eea" 
          strokeWidth={3}
          dot={{ fill: '#667eea', r: 4 }}
          activeDot={{ r: 6 }}
          name={t('progress.charts.weight')}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

// Monthly Cost Chart
const MonthlyCostChart = ({ data, formatCurrency, t }) => (
  <div className={styles.chartCard}>
    <h3 className={styles.chartTitle}>{t('progress.charts.monthlyCost')}</h3>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="month" stroke="#6b7280" />
        <YAxis stroke="#6b7280" />
        <Tooltip 
          formatter={(value) => [formatCurrency(value), t('progress.charts.amount')]}
          contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
        />
        <Legend />
        <Bar dataKey="cost" fill="#667eea" name={t('progress.charts.totalCost')} radius={[8, 8, 0, 0]} />
        <Bar dataKey="savings" fill="#10b981" name={t('progress.charts.savings')} radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

// Feed Consumption Chart
const FeedConsumptionChart = ({ data, t }) => (
  <div className={styles.chartCard}>
    <h3 className={styles.chartTitle}>{t('progress.charts.feedConsumption')}</h3>
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="week" stroke="#6b7280" />
        <YAxis stroke="#6b7280" />
        <Tooltip 
          formatter={(value) => [`${value} ${t('progress.charts.kg')}`, t('progress.charts.feed')]}
          contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
        />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="feed" 
          stroke="#10b981" 
          fill="#10b981" 
          fillOpacity={0.2}
          name={t('progress.charts.feed')}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

// Cost Breakdown Chart
const CostBreakdownChart = ({ data, formatCurrency, t }) => (
  <div className={styles.chartCard}>
    <h3 className={styles.chartTitle}>{t('progress.charts.costBreakdown')}</h3>
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value, name, props) => [
            `${value}% (${formatCurrency(props.payload.cost)})`,
            props.payload.name
          ]}
          contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

// Data Tables Component
const DataTables = ({ flocks, recommendations, formatDate, formatCurrency, t }) => (
  <div className={styles.dataTables}>
    <FlocksTable flocks={flocks} t={t} />
    <RecommendationsTable 
      recommendations={recommendations} 
      formatDate={formatDate} 
      formatCurrency={formatCurrency} 
      t={t} 
    />
  </div>
);

// Flocks Table
const FlocksTable = ({ flocks, t }) => (
  <div className={styles.tableSection}>
    <h3 className={styles.tableTitle}>{t('progress.tables.recentFlocks')}</h3>
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>{t('progress.tables.flockName')}</th>
            <th>{t('progress.tables.birdType')}</th>
            <th>{t('progress.tables.quantity')}</th>
            <th>{t('progress.tables.age')}</th>
            <th>{t('progress.tables.status')}</th>
            <th>{t('progress.tables.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {flocks.length > 0 ? (
            flocks.slice(0, 5).map(flock => (
              <tr key={flock.id}>
                <td className={styles.flockName}>{flock.name}</td>
                <td>{flock.bird_type || flock.birdType || t('progress.unknown')}</td>
                <td>{flock.quantity || 0}</td>
                <td>{flock.age || 0} {t('progress.weeks')}</td>
                <td>
                  <span className={styles.statusBadge}>
                    {flock.status || t('progress.active')}
                  </span>
                </td>
                <td>
                  <Link to={`/flocks/${flock.id}`} className={styles.viewLink}>
                    {t('progress.tables.viewDetails')}
                  </Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className={styles.emptyState}>
                {t('progress.noFlocks')} <Link to="/flocks/new">{t('progress.createFirstFlock')}</Link>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

// Recommendations Table
const RecommendationsTable = ({ recommendations, formatDate, formatCurrency, t }) => (
  <div className={styles.tableSection}>
    <h3 className={styles.tableTitle}>{t('progress.tables.recentRecommendations')}</h3>
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>{t('progress.tables.date')}</th>
            <th>{t('progress.tables.flock')}</th>
            <th>{t('progress.tables.feedType')}</th>
            <th>{t('progress.tables.cost')}</th>
            <th>{t('progress.tables.status')}</th>
            <th>{t('progress.tables.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {recommendations.length > 0 ? (
            recommendations.slice(0, 5).map(rec => (
              <tr key={rec.id}>
                <td>{formatDate(rec.created_at || rec.createdAt)}</td>
                <td>{rec.flock_name || rec.flockName || t('progress.unknown')}</td>
                <td>{rec.feed_type || rec.feedType || t('progress.general')}</td>
                <td>{formatCurrency(rec.total_cost || rec.totalCost || 0)}</td>
                <td>
                  <span className={`${styles.statusBadge} ${styles[rec.status?.toLowerCase() || 'completed']}`}>
                    {rec.status || t('progress.completed')}
                  </span>
                </td>
                <td>
                  <Link to={`/recommendations/${rec.id}`} className={styles.viewLink}>
                    {t('progress.tables.viewDetails')}
                  </Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className={styles.emptyState}>
                {t('progress.noRecommendations')} <Link to="/recommendations/new">{t('progress.generateFirstRecommendation')}</Link>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

// Insights Section Component
const InsightsSection = ({ stats, formatCurrency, t }) => (
  <section className={styles.insightsSection}>
    <h2 className={styles.sectionTitle}>{t('progress.insights.title')}</h2>
    
    <div className={styles.insightsGrid}>
      <InsightCard
        icon="💡"
        title={t('progress.insights.growthPerformance.title')}
        message={t('progress.insights.growthPerformance.message', { percentage: stats.averageGrowth })}
      />
      <InsightCard
        icon="💰"
        title={t('progress.insights.costEfficiency.title')}
        message={t('progress.insights.costEfficiency.message', { 
          savings: formatCurrency(stats.totalSavings),
          percentage: 15 
        })}
      />
      <InsightCard
        icon="📊"
        title={t('progress.insights.feedEfficiency.title')}
        message={t('progress.insights.feedEfficiency.message', { 
          fcr: stats.feedEfficiency,
          targetFcr: 2.5 
        })}
      />
    </div>
    
    <div className={styles.actionButtons}>
      <Link to="/recommendations/new" className={styles.primaryButton}>
        <span>🤖</span> {t('progress.actions.generateRecommendation')}
      </Link>
      <button className={styles.secondaryButton} onClick={() => window.print()}>
        <span>📄</span> {t('progress.actions.printReport')}
      </button>
      <Link to="/dashboard" className={styles.backButton}>
        <span>←</span> {t('progress.actions.backToDashboard')}
      </Link>
    </div>
  </section>
);

// Insight Card Component
const InsightCard = ({ icon, title, message }) => (
  <div className={styles.insightCard}>
    <div className={styles.insightIcon}>{icon}</div>
    <h4 className={styles.insightTitle}>{title}</h4>
    <p className={styles.insightMessage}>{message}</p>
  </div>
);

export default Progress;