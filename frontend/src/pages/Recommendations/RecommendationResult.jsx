import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import styles from './RecommendationResult.module.css';

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'];

const RecommendationResult = ({ recommendation }) => {
  const { t } = useTranslation();

  // Safe data extraction
  const safeRecommendation = useMemo(() => recommendation || {}, [recommendation]);
  const {
    flock_name = t('common.unknown'),
    feed_type = t('common.unknown'),
    formulation_objective,
    created_at,
    status,
    ingredients = [],
    nutritional_content = {}
  } = safeRecommendation;

  // Format date
  const formattedDate = useMemo(() => {
    try {
      return created_at ? format(new Date(created_at), 'PPP') : t('common.notAvailable');
    } catch {
      return t('common.notAvailable');
    }
  }, [created_at, t]);

  // Process ingredients
  const { formattedIngredients, totalAmountKg, totalPercentage, displayTotalCost, totalIngredients } = useMemo(() => {
    const formatted = ingredients.map((ing, idx) => ({
      ...ing,
      index: idx + 1,
      ingredient_name: ing.ingredient_name || t('common.unknown'),
      percentage: Number(ing.percentage) || 0,
      amount_kg: Number(ing.amount_kg) || 0,
      cost: Number(ing.cost) || 0,
      cost_per_kg: Number(ing.cost_per_kg) || 0
    })).sort((a, b) => b.percentage - a.percentage);

    const totalKg = formatted.reduce((sum, ing) => sum + ing.amount_kg, 0);
    const totalPct = formatted.reduce((sum, ing) => sum + ing.percentage, 0);
    const totalCost = formatted.reduce((sum, ing) => sum + ing.cost, 0);

    return {
      formattedIngredients: formatted,
      totalAmountKg: totalKg,
      totalPercentage: totalPct,
      displayTotalCost: totalCost,
      totalIngredients: formatted.length
    };
  }, [ingredients, t]);

  const displayCostPerKg = totalAmountKg > 0 ? displayTotalCost / totalAmountKg : 0;

  // Prepare chart data
  const pieData = useMemo(() => 
    formattedIngredients
      .filter(ing => ing.percentage > 0)
      .map(ing => ({
        name: ing.ingredient_name,
        value: ing.percentage
      })),
    [formattedIngredients]
  );

  // Process nutritional data
  const { formattedNutritional, nutrientData } = useMemo(() => {
    const formatted = {};
    const data = [];

    Object.entries(nutritional_content).forEach(([key, value]) => {
      if (value && typeof value === 'object') {
        const actual = Number(value.actual) || 0;
        const min = Number(value.min) || 0;
        const max = Number(value.max) || null;

        formatted[key] = { actual, min, max };

        if (actual > 0 || min > 0) {
          data.push({
            nutrient: key.replace(/_/g, ' ').toUpperCase(),
            actual,
            min,
            max: max || min * 1.5
          });
        }
      }
    });

    return { formattedNutritional: formatted, nutrientData: data };
  }, [nutritional_content]);

  // Helper functions
  const getStatusClass = (status) => {
    const statusMap = {
      'completed': styles.statusCompleted,
      'pending': styles.statusPending,
      'failed': styles.statusFailed
    };
    return statusMap[status?.toLowerCase()] || styles.statusCompleted;
  };

  const getNutrientStatus = (actual, min, max) => {
    if (actual < min) return { status: t('recommendations.result.below'), className: styles.statusBelow };
    if (max && actual > max) return { status: t('recommendations.result.above'), className: styles.statusAbove };
    return { status: t('recommendations.result.optimal'), className: styles.statusOptimal };
  };

  const getDeviation = (actual, min, max) => {
    if (actual < min) return `${((min - actual) / min * 100).toFixed(1)}% ${t('recommendations.result.below')}`;
    if (max && actual > max) return `${((actual - max) / max * 100).toFixed(1)}% ${t('recommendations.result.above')}`;
    return t('recommendations.result.withinRange');
  };

  const exportToCSV = () => {
    const headers = ['Ingredient', 'Percentage', 'Amount (kg)', 'Cost (UGX)', 'Cost/kg (UGX)'];
    const rows = formattedIngredients.map(ing => [
      ing.ingredient_name,
      ing.percentage.toFixed(2),
      ing.amount_kg.toFixed(2),
      ing.cost.toFixed(2),
      ing.cost_per_kg.toFixed(2)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `feed_recommendation_${flock_name}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>{t('recommendations.result.title')}</h1>
          <span className={`${styles.statusBadge} ${getStatusClass(status)}`}>
            {status || t('recommendations.status.completed')}
          </span>
        </div>
        <div className={styles.metaGrid}>
          <MetaItem label={t('recommendations.list.flock')} value={flock_name} />
          <MetaItem label={t('recommendations.list.feedType')} value={feed_type} />
          <MetaItem 
            label={t('recommendations.result.objective')} 
            value={formulation_objective ? formulation_objective.replace(/_/g, ' ') : t('recommendations.result.objective')} 
          />
          <MetaItem label={t('recommendations.result.generated')} value={formattedDate} />
        </div>
      </div>

      {/* Cost Overview Cards */}
      <div className={styles.costGrid}>
        <CostCard
          title={t('recommendations.result.totalCost')}
          amount={`UGX ${displayTotalCost.toLocaleString()}`}
          subtitle={t('recommendations.result.forFeed', { amount: totalAmountKg.toFixed(1) })}
          icon="💰"
        />
        <CostCard
          title={t('recommendations.result.costPerKg')}
          amount={`UGX ${displayCostPerKg.toFixed(2)}`}
          subtitle={t('recommendations.result.avgPrice')}
          icon="📊"
        />
        <CostCard
          title={t('recommendations.result.ingredients')}
          amount={totalIngredients}
          subtitle={t('recommendations.result.differentComponents')}
          icon="🌾"
        />
        <CostCard
          title={t('recommendations.result.totalWeight')}
          amount={`${totalAmountKg.toFixed(1)} kg`}
          subtitle={t('recommendations.result.totalPercentage', { percentage: totalPercentage.toFixed(1) })}
          icon="⚖️"
        />
      </div>

      {/* Ingredient Composition Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          {t('recommendations.result.ingredientComposition', { count: totalIngredients })}
        </h2>
        
        <div className={styles.compositionLayout}>
          {/* Pie Chart */}
          <div className={styles.chartCard}>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.noData}>{t('recommendations.result.noChartData')}</div>
            )}
          </div>

          {/* Ingredient Table */}
          <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <h3>{t('recommendations.result.detailedBreakdown')}</h3>
              <span className={styles.tableSummary}>
                {t('recommendations.result.tableSummary', {
                  count: totalIngredients,
                  amount: totalAmountKg.toFixed(1),
                  cost: displayTotalCost.toLocaleString()
                })}
              </span>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{t('recommendations.result.tableHeaders.ingredient')}</th>
                    <th>{t('recommendations.result.tableHeaders.percentage')}</th>
                    <th>{t('recommendations.result.tableHeaders.amount')}</th>
                    <th>{t('recommendations.result.tableHeaders.cost')}</th>
                    <th>{t('recommendations.result.tableHeaders.costPerKg')}</th>
                    <th>{t('recommendations.result.tableHeaders.percentOfTotal')}</th>
                  </tr>
                </thead>
                <tbody>
                  {formattedIngredients.map((ing, idx) => (
                    <tr key={idx}>
                      <td>{ing.index}</td>
                      <td className={styles.ingredientName}>{ing.ingredient_name}</td>
                      <td>{ing.percentage.toFixed(2)}%</td>
                      <td>{ing.amount_kg.toFixed(2)} kg</td>
                      <td>UGX {ing.cost.toFixed(2)}</td>
                      <td>UGX {ing.cost_per_kg.toFixed(2)}</td>
                      <td>{displayTotalCost > 0 ? ((ing.cost / displayTotalCost) * 100).toFixed(1) : 0}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Nutritional Analysis Section */}
      {nutrientData.length > 0 ? (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('recommendations.result.nutritionalAnalysis')}</h2>
          
          <div className={styles.chartCard}>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={nutrientData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nutrient" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="actual" fill="#4ECDC4" name={t('recommendations.result.nutrientTableHeaders.actual')} />
                <Bar dataKey="min" fill="#FFA07A" name={t('recommendations.result.nutrientTableHeaders.minRequired')} />
                <Bar dataKey="max" fill="#98D8C8" name={t('recommendations.result.nutrientTableHeaders.maxAllowed')} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.tableCard}>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>{t('recommendations.result.nutrientTableHeaders.nutrient')}</th>
                    <th>{t('recommendations.result.nutrientTableHeaders.actual')}</th>
                    <th>{t('recommendations.result.nutrientTableHeaders.minRequired')}</th>
                    <th>{t('recommendations.result.nutrientTableHeaders.maxAllowed')}</th>
                    <th>{t('recommendations.result.nutrientTableHeaders.status')}</th>
                    <th>{t('recommendations.result.nutrientTableHeaders.deviation')}</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(formattedNutritional).map(([key, value]) => {
                    const statusInfo = getNutrientStatus(value.actual, value.min, value.max);
                    return (
                      <tr key={key}>
                        <td className={styles.nutrientName}>{key.replace(/_/g, ' ').toUpperCase()}</td>
                        <td>{value.actual.toFixed(2)}</td>
                        <td>{value.min.toFixed(2)}</td>
                        <td>{value.max ? value.max.toFixed(2) : 'N/A'}</td>
                        <td><span className={statusInfo.className}>{statusInfo.status}</span></td>
                        <td>{getDeviation(value.actual, value.min, value.max)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ) : (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('recommendations.result.nutritionalAnalysis')}</h2>
          <div className={styles.noData}>{t('recommendations.result.noNutritionData')}</div>
        </section>
      )}

      {/* Summary Section */}
      <section className={styles.summarySection}>
        <h2 className={styles.sectionTitle}>{t('recommendations.result.formulationSummary')}</h2>
        <div className={styles.summaryGrid}>
          <SummaryCard title={t('recommendations.result.costEfficiency')}>
            <SummaryItem label={t('recommendations.result.avgCostPerKg')} value={`UGX ${displayCostPerKg.toFixed(2)}`} />
            <SummaryItem label={t('recommendations.result.totalFormulationCost')} value={`UGX ${displayTotalCost.toLocaleString()}`} />
            <SummaryItem label={t('recommendations.result.costPerBird')} value={`UGX ${(displayCostPerKg / 100).toFixed(2)}`} />
          </SummaryCard>
          
          <SummaryCard title={t('recommendations.result.ingredientDiversity')}>
            <SummaryItem label={t('recommendations.result.numIngredients')} value={totalIngredients} />
            <SummaryItem 
              label={t('recommendations.result.mainProtein')} 
              value={formattedIngredients.find(i => i.percentage > 20 && (i.ingredient_name.toLowerCase().includes('soya') || i.ingredient_name.toLowerCase().includes('fish')))?.ingredient_name || t('common.none')} 
            />
            <SummaryItem 
              label={t('recommendations.result.mainEnergy')} 
              value={formattedIngredients.find(i => i.percentage > 30)?.ingredient_name || 'Maize'} 
            />
          </SummaryCard>
          
          <SummaryCard title={t('recommendations.result.nutritionalQuality')}>
            <SummaryItem label={t('recommendations.result.proteinContent')} value={`${formattedNutritional.protein?.actual?.toFixed(1) || 'N/A'}%`} />
            <SummaryItem label={t('recommendations.result.energyLevel')} value={`${formattedNutritional.energy?.actual?.toFixed(0) || 'N/A'} kcal/kg`} />
            <SummaryItem label={t('recommendations.result.calciumLevel')} value={`${formattedNutritional.calcium?.actual?.toFixed(2) || 'N/A'}%`} />
          </SummaryCard>
        </div>
      </section>

      {/* Action Buttons */}
      <div className={styles.actions}>
        <button className={styles.btn} onClick={() => window.print()}>
          <span>🖨️</span> {t('common.print')}
        </button>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={exportToCSV}>
          <span>📥</span> {t('recommendations.result.exportCSV')}
        </button>
        <button className={styles.btn} onClick={() => alert('Share functionality coming soon!')}>
          <span>📤</span> {t('recommendations.result.shareReport')}
        </button>
      </div>
    </div>
  );
};

// Sub-components
const MetaItem = ({ label, value }) => (
  <div className={styles.metaItem}>
    <span className={styles.metaLabel}>{label}</span>
    <span className={styles.metaValue}>{value}</span>
  </div>
);

const CostCard = ({ title, amount, subtitle, icon }) => (
  <div className={styles.costCard}>
    <div className={styles.costIcon}>{icon}</div>
    <h3 className={styles.costTitle}>{title}</h3>
    <p className={styles.costAmount}>{amount}</p>
    <p className={styles.costSubtitle}>{subtitle}</p>
  </div>
);

const SummaryCard = ({ title, children }) => (
  <div className={styles.summaryCard}>
    <h3 className={styles.summaryCardTitle}>{title}</h3>
    <div className={styles.summaryCardContent}>{children}</div>
  </div>
);

const SummaryItem = ({ label, value }) => (
  <div className={styles.summaryItem}>
    <span className={styles.summaryLabel}>{label}:</span>
    <strong className={styles.summaryValue}>{value}</strong>
  </div>
);

export default RecommendationResult;