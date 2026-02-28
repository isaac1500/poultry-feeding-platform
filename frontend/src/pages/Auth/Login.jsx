// src/pages/Auth/Login.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../utils/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import './Auth.css';

// Create placeholder icons if the Icons file doesn't exist
const MailIcon = () => <span className="icon">📧</span>;
const LockIcon = () => <span className="icon">🔒</span>;
const AlertIcon = () => <span className="icon">⚠️</span>;
const GoogleIcon = () => <span className="icon">G</span>;
const LogoIcon = () => <span className="logo">🐔</span>;

// Create a simple LanguageSwitcher component if it doesn't exist
const LanguageSwitcher = () => (
  <div className="language-switcher">
    <select className="language-select">
      <option value="en">English</option>
      <option value="fr">Français</option>
    </select>
  </div>
);

export default function Login() {
  // State Management
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Hooks
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();

  // Effects
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    const savedEmail = localStorage.getItem('poultryEmail');
    if (savedEmail) {
      setFormData(prev => ({
        ...prev,
        email: savedEmail,
        rememberMe: true
      }));
    }
  }, []);

  // Handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getErrorMessage = (errorCode) => {
    const errorMessages = {
      'auth/invalid-email': t('login.errors.invalidEmail'),
      'auth/user-disabled': t('login.errors.userDisabled'),
      'auth/user-not-found': t('login.errors.userNotFound'),
      'auth/wrong-password': t('login.errors.wrongPassword'),
      'auth/too-many-requests': t('login.errors.tooManyRequests'),
    };
    return errorMessages[errorCode] || t('login.errors.default');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.email || !formData.password) {
      setError(t('login.validation.required'));
      return;
    }
    
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      
      if (formData.rememberMe) {
        localStorage.setItem('poultryEmail', formData.email);
      } else {
        localStorage.removeItem('poultryEmail');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log('Google login clicked');
    // Implement Google login logic here
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Main Auth Card */}
        <div className="auth-card">
          <AuthHeader t={t} />
          <LoginForm
            formData={formData}
            error={error}
            loading={loading}
            t={t}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onGoogleLogin={handleGoogleLogin}
          />
          <AuthFooter t={t} />
        </div>

        {/* Side Panel */}
        <AuthSidePanel t={t} />
      </div>
    </div>
  );
}

// Sub-components
function AuthHeader({ t }) {
  return (
    <div className="auth-header">
      <div className="logo">
        <LogoIcon />
        <h1>{t('login.appName')}</h1>
      </div>
      <p className="tagline">{t('login.tagline')}</p>
    </div>
  );
}

function LoginForm({ formData, error, loading, t, onInputChange, onSubmit, onGoogleLogin }) {
  return (
    <form onSubmit={onSubmit} className="auth-form">
      <div className="form-header">
        <h2>{t('login.welcome')}</h2>
        <p className="form-subtitle">{t('login.subtitle')}</p>
      </div>
      
      {error && <ErrorAlert message={error} />}

      <FormInput
        id="email"
        name="email"
        type="email"
        label={t('login.email')}
        placeholder={t('login.emailPlaceholder')}
        value={formData.email}
        onChange={onInputChange}
        icon={<MailIcon />}
        disabled={loading}
        autoComplete="email"
      />

      <FormInput
        id="password"
        name="password"
        type="password"
        label={t('login.password')}
        placeholder={t('login.passwordPlaceholder')}
        value={formData.password}
        onChange={onInputChange}
        icon={<LockIcon />}
        disabled={loading}
        autoComplete="current-password"
        forgotLink={
          <Link to="/forgot-password" className="forgot-link">
            {t('login.forgotPassword')}
          </Link>
        }
      />

      <div className="form-options">
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={onInputChange}
            disabled={loading}
          />
          <span className="checkbox-custom"></span>
          <span>{t('login.rememberMe')}</span>
        </label>
      </div>

      <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
        {loading ? (
          <>
            <span className="spinner"></span>
            {t('login.loggingIn')}
          </>
        ) : (
          t('login.loginButton')
        )}
      </button>

      <div className="divider">
        <span>{t('login.or')}</span>
      </div>

      <button
        type="button"
        className="btn btn-google"
        onClick={onGoogleLogin}
        disabled={loading}
      >
        <GoogleIcon />
        {t('login.googleButton')}
      </button>
    </form>
  );
}

function FormInput({ id, name, type, label, placeholder, value, onChange, icon, disabled, autoComplete, forgotLink }) {
  return (
    <div className="form-group">
      <div className="label-row">
        <label htmlFor={id}>{label}</label>
        {forgotLink}
      </div>
      <div className="input-with-icon">
        {icon}
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          disabled={disabled}
          autoComplete={autoComplete}
        />
      </div>
    </div>
  );
}

function ErrorAlert({ message }) {
  return (
    <div className="alert alert-error">
      <AlertIcon />
      <span>{message}</span>
    </div>
  );
}

function AuthFooter({ t }) {
  return (
    <div className="auth-footer">
      <p>
        {t('login.noAccount')}{' '}
        <Link to="/register" className="link">
          {t('login.createAccount')}
        </Link>
      </p>
      <p className="help-text">
        {t('login.needHelp')}{' '}
        <Link to="/help" className="link">
          {t('login.contactSupport')}
        </Link>
      </p>
    </div>
  );
}

function AuthSidePanel({ t }) {
  return (
    <div className="auth-side-panel">
      <div className="side-content">
        <LanguageSwitcher />
        
        <div className="side-section">
          <h3>{t('login.sidePanel.title')}</h3>
          <ul className="features-list">
            <li>
              <span className="feature-icon">✓</span>
              {t('login.sidePanel.feature1')}
            </li>
            <li>
              <span className="feature-icon">✓</span>
              {t('login.sidePanel.feature2')}
            </li>
            <li>
              <span className="feature-icon">✓</span>
              {t('login.sidePanel.feature3')}
            </li>
            <li>
              <span className="feature-icon">✓</span>
              {t('login.sidePanel.feature4')}
            </li>
            <li>
              <span className="feature-icon">✓</span>
              {t('login.sidePanel.feature5')}
            </li>
          </ul>
        </div>
        
        <div className="testimonial">
          <div className="quote-icon">"</div>
          <p>{t('login.sidePanel.testimonial')}</p>
          <span className="author">— {t('login.sidePanel.testimonialAuthor')}</span>
        </div>
        
        {/* <div className="demo-credentials">
          <h4>{t('login.sidePanel.demoTitle')}</h4>
          <div className="demo-info">
            <div className="demo-item">
              <span className="demo-label">{t('login.sidePanel.demoEmail')}:</span>
              <code>demo@poultryfeed.com</code>
            </div>
            <div className="demo-item">
              <span className="demo-label">{t('login.sidePanel.demoPassword')}:</span>
              <code>demo123</code>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}