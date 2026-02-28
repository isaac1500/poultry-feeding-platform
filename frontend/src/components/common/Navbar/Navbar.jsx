// src/components/common/Navbar/Navbar.jsx - UPDATED WITH I18N
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from "../../../contexts/AuthContext.jsx";
import { useTranslation } from 'react-i18next'; // ADD THIS
import styles from './Navbar.module.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation(); // ADD THIS
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [location]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveDropdown(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleDropdown = (dropdownName, e) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  // UPDATED NAV ITEMS WITH TRANSLATIONS
  const navItems = [
    { path: '/dashboard', label: t('nav.dashboard'), icon: '', requiresAuth: true },
    { path: '/flocks', label: t('nav.flocks'), icon: '', requiresAuth: true },
    { path: '/recommendations', label: t('nav.recommendations'), icon: '', requiresAuth: true },
    { path: '/progress', label: t('nav.tracking'), icon: '', requiresAuth: true },
    
  ];

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.navContainer}>
        {/* Logo/Brand */}
        <div className={styles.navBrand}>
          <Link to="/" className={styles.logoLink}>
            <div className={styles.logo}>
              <span className={styles.logoIcon}></span>
              <div className={styles.logoText}>
                <span className={styles.logoTitle}>{t('app.title')}</span>
                <span className={styles.logoSubtitle}>{t('app.tagline')}</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className={styles.navMenu}>
          {user ? (
            <>
              {/* Navigation Items */}
              <div className={styles.navItems}>
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`${styles.navLink} ${isActive(item.path) ? styles.active : ''}`}
                  >
                    <span className={styles.navIcon}>{item.icon}</span>
                    <span className={styles.navLabel}>{item.label}</span>
                    {isActive(item.path) && <span className={styles.activeIndicator}></span>}
                  </Link>
                ))}
              </div>

              {/* User Profile Dropdown */}
              <div className={styles.userSection}>
                <div 
                  className={`${styles.userDropdown} ${activeDropdown === 'user' ? styles.active : ''}`}
                  onClick={(e) => toggleDropdown('user', e)}
                >
                  <div className={styles.userAvatar}>
                    {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className={styles.userInfo}>
                    <span className={styles.userName}>{user.name || user.email}</span>
                    <span className={styles.userRole}>Poultry Farmer</span>
                  </div>
                  <span className={styles.dropdownArrow}></span>
                  
                  {/* Dropdown Menu - UPDATED WITH TRANSLATIONS */}
                  {activeDropdown === 'user' && (
                    <div className={styles.dropdownMenu}>
                      <Link to="/profile" className={styles.dropdownItem}>
                        <span className={styles.dropdownIcon}></span>
                        {t('common.profile')}
                      </Link>
                      <Link to="/settings" className={styles.dropdownItem}>
                        <span className={styles.dropdownIcon}></span>
                        {t('nav.settings')}
                      </Link>
                      <div className={styles.dropdownDivider}></div>
                      <Link to="/help" className={styles.dropdownItem}>
                        <span className={styles.dropdownIcon}></span>
                        {t('common.help')}
                      </Link>
                      <button onClick={handleLogout} className={styles.dropdownItem}>
                        <span className={styles.dropdownIcon}></span>
                        {t('auth.logout')}
                      </button>
                    </div>
                  )}
                </div>

                {/* Notifications */}
                <div 
                  className={`${styles.notificationBell} ${activeDropdown === 'notifications' ? styles.active : ''}`}
                  onClick={(e) => toggleDropdown('notifications', e)}
                >
                  <span className={styles.bellIcon}></span>
                  <span className={styles.notificationBadge}>3</span>
                  
                  {/* Notifications Dropdown */}
                  {activeDropdown === 'notifications' && (
                    <div className={styles.notificationsMenu}>
                      <div className={styles.notificationsHeader}>
                        <h3>{t('common.notifications')}</h3>
                        <button className={styles.markAllRead}>{t('common.markAllRead')}</button>
                      </div>
                      <div className={styles.notificationsList}>
                        <div className={styles.notificationItem}>
                          <div className={styles.notificationIcon}></div>
                          <div className={styles.notificationContent}>
                            <p>{t('notifications.newRecommendation')}</p>
                            <span className={styles.notificationTime}>{t('common.hoursAgo', { count: 2 })}</span>
                          </div>
                        </div>
                        <div className={styles.notificationItem}>
                          <div className={styles.notificationIcon}></div>
                          <div className={styles.notificationContent}>
                            <p>{t('notifications.lowInventory')}</p>
                            <span className={styles.notificationTime}>{t('common.hoursAgo', { count: 5 })}</span>
                          </div>
                        </div>
                        <div className={styles.notificationItem}>
                          <div className={styles.notificationIcon}></div>
                          <div className={styles.notificationContent}>
                            <p>{t('notifications.weeklyReport')}</p>
                            <span className={styles.notificationTime}>{t('common.daysAgo', { count: 1 })}</span>
                          </div>
                        </div>
                      </div>
                      <Link to="/notifications" className={styles.viewAll}>
                        {t('common.viewAll')}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            // Auth buttons for non-logged in users - UPDATED WITH TRANSLATIONS
            <div className={styles.authButtons}>
              <Link to="/login" className={styles.loginButton}>
                {t('auth.login')}
              </Link>
              <Link to="/register" className={styles.registerButton}>
                {t('auth.register')}
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className={styles.mobileToggle}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className={`${styles.hamburger} ${isMobileMenuOpen ? styles.open : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className={styles.mobileMenu}>
            {user ? (
              <>
                {/* User Info in Mobile */}
                <div className={styles.mobileUserInfo}>
                  <div className={styles.mobileUserAvatar}>
                    {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <p className={styles.mobileUserName}>{user.name || user.email}</p>
                    <p className={styles.mobileUserEmail}>{user.email}</p>
                  </div>
                </div>

                {/* Mobile Navigation Items */}
                <div className={styles.mobileNavItems}>
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`${styles.mobileNavLink} ${isActive(item.path) ? styles.active : ''}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className={styles.mobileNavIcon}>{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  ))}
                  
                  <div className={styles.mobileNavDivider}></div>
                  
                  <Link to="/profile" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                    <span className={styles.mobileNavIcon}></span>
                    <span>{t('common.profile')}</span>
                  </Link>
                  
                  <Link to="/settings" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                    <span className={styles.mobileNavIcon}></span>
                    <span>{t('nav.settings')}</span>
                  </Link>
                  
                  <Link to="/help" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                    <span className={styles.mobileNavIcon}></span>
                    <span>{t('common.help')}</span>
                  </Link>
                  
                  <button onClick={handleLogout} className={styles.mobileLogoutButton}>
                    <span className={styles.mobileNavIcon}></span>
                    <span>{t('auth.logout')}</span>
                  </button>
                </div>
              </>
            ) : (
              <div className={styles.mobileAuthButtons}>
                <Link to="/login" className={styles.mobileLoginButton} onClick={() => setIsMobileMenuOpen(false)}>
                  {t('auth.login')}
                </Link>
                <Link to="/register" className={styles.mobileRegisterButton} onClick={() => setIsMobileMenuOpen(false)}>
                  {t('auth.register')}
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;