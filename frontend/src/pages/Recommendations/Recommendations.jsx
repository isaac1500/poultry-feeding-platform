import React, { useState, useEffect } from 'react';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';
import RecommendationForm from './RecommendationForm';
import RecommendationResult from './RecommendationResult';
import RecommendationList from './RecommendationList';
import styles from './Recommendations.module.css';

const Recommendations = () => {
  return (
    <div className={styles.pageWrapper}>
      <Routes>
        <Route path="/" element={<RecommendationList />} />
        <Route path="/new" element={<RecommendationPage />} />
        <Route path="/:id" element={<RecommendationDetailPage />} />
      </Routes>
    </div>
  );
};

// ==================== NEW RECOMMENDATION PAGE ====================
const RecommendationPage = () => {
  const [recommendationResult, setRecommendationResult] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  const handleSuccess = (result) => {
    setIsAnimating(true);
    setTimeout(() => {
      setRecommendationResult(result);
      setIsAnimating(false);
    }, 300);
  };

  const handleReset = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setRecommendationResult(null);
      setIsAnimating(false);
    }, 300);
  };

  const handleBackToList = () => {
    navigate('/recommendations');
  };

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <button onClick={handleBackToList} className={styles.backButton}>
            <span>←</span> Back to List
          </button>
          <h1 className={styles.pageTitle}>
            {!recommendationResult ? 'Generate Feed Recommendation' : 'Recommendation Results'}
          </h1>
          <div className={styles.headerSpacer} />
        </div>
      </header>

      {/* Main Content */}
      <main className={`${styles.pageContent} ${isAnimating ? styles.fadeOut : styles.fadeIn}`}>
        {!recommendationResult ? (
          <FormSection onSuccess={handleSuccess} />
        ) : (
          <ResultSection 
            recommendation={recommendationResult} 
            onReset={handleReset}
            onBackToList={handleBackToList}
          />
        )}
      </main>
    </div>
  );
};

// ==================== FORM SECTION COMPONENT ====================
const FormSection = ({ onSuccess }) => {
  return (
    <div className={styles.formSection}>
      <div className={styles.formIntro}>
        <div className={styles.introIcon}>🌾</div>
        <h2>Create Your Custom Feed Formula</h2>
        <p>Fill in the details below to generate an optimized feed recommendation for your flock</p>
      </div>
      <RecommendationForm onSuccess={onSuccess} />
    </div>
  );
};

// ==================== RESULT SECTION COMPONENT ====================
const ResultSection = ({ recommendation, onReset, onBackToList }) => {
  return (
    <div className={styles.resultSection}>
      {/* Success Banner */}
      <div className={styles.successBanner}>
        <div className={styles.successIcon}>
          <span>✓</span>
        </div>
        <div className={styles.successContent}>
          <h2 className={styles.successTitle}>Recommendation Generated Successfully!</h2>
          <p className={styles.successText}>
            Your optimized feed formulation has been created. Review the detailed breakdown below.
          </p>
        </div>
      </div>

      {/* Results Display */}
      <div className={styles.resultContent}>
        <RecommendationResult recommendation={recommendation} />
      </div>

      {/* Action Buttons */}
      <div className={styles.resultActions}>
        <button onClick={onReset} className={styles.actionButton}>
          <span>➕</span> Generate Another Recommendation
        </button>
        <button onClick={onBackToList} className={styles.actionButtonSecondary}>
          <span>📋</span> View All Recommendations
        </button>
      </div>
    </div>
  );
};

// ==================== DETAIL PAGE COMPONENT ====================
const RecommendationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Simulate API call - replace with actual fetch logic
    const fetchRecommendation = async () => {
      try {
        setLoading(true);
        setError('');
        
        // TODO: Replace with actual API call
        // const response = await api.getRecommendation(id);
        // setRecommendation(response.data);
        
        // Simulated delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For now, set error since we don't have real data
        setError('Recommendation not found. This is a placeholder for the actual API integration.');
        
      } catch (err) {
        setError(err.message || 'Failed to load recommendation. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendation();
  }, [id]);

  const handleBackToList = () => {
    navigate('/recommendations');
  };

  // Loading State
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}>
            <div className={styles.spinnerRing}></div>
            <div className={styles.spinnerRing}></div>
            <div className={styles.spinnerRing}></div>
          </div>
          <h2 className={styles.loadingTitle}>Loading Recommendation...</h2>
          <p className={styles.loadingText}>Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2 className={styles.errorTitle}>Unable to Load Recommendation</h2>
          <p className={styles.errorText}>{error}</p>
          <div className={styles.errorActions}>
            <button onClick={() => window.location.reload()} className={styles.retryButton}>
              <span>🔄</span> Retry
            </button>
            <button onClick={handleBackToList} className={styles.backButtonError}>
              <span>←</span> Back to List
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success State
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <button onClick={handleBackToList} className={styles.backButton}>
            <span>←</span> Back to List
          </button>
          <h1 className={styles.pageTitle}>Recommendation Details</h1>
          <div className={styles.headerSpacer} />
        </div>
      </header>

      <main className={styles.pageContent}>
        <RecommendationResult recommendation={recommendation} />
      </main>
    </div>
  );
};

export default Recommendations;