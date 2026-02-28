// src/components/common/Sidebar/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';

const Sidebar = ({ isOpen, isMobile, closeSidebar }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/flocks', icon: '🐔', label: 'Flocks' },
    { path: '/recommendations', icon: '🧠', label: 'Recommendations' },
    { path: '/progress', icon: '📈', label: 'Progress' },
    { path: '/reports', icon: '📋', label: 'Reports' },
    { path: '/settings', icon: '⚙️', label: 'Settings' },
  ];

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  if (!isOpen && isMobile) return null;

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed} ${isMobile ? styles.mobile : ''}`}>
      {isMobile && (
        <button className={styles.closeButton} onClick={closeSidebar}>
          ✕
        </button>
      )}
      
      <div className={styles.sidebarHeader}>
        <h3>Navigation</h3>
      </div>
      
      <nav className={styles.sidebarNav}>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`${styles.navItem} ${isActive(item.path) ? styles.active : ''}`}
            onClick={isMobile ? closeSidebar : undefined}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
          </Link>
        ))}
      </nav>
      
      <div className={styles.sidebarFooter}>
        <div className={styles.quickStats}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>12</span>
            <span className={styles.statLabel}>Active Flocks</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>8</span>
            <span className={styles.statLabel}>This Week</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
