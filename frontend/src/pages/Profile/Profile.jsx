// src/pages/Profile/Profile.jsx
import React from 'react';
import { useAuth } from '../../components/common/authcontext.jsx';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  
  return (
    <div className="profile">
      <h1>My Profile</h1>
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <div className="avatar-large">
              {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="profile-info">
              <h2>{user?.name || user?.email || 'User'}</h2>
              <p className="email">{user?.email || 'No email available'}</p>
              <p className="role">Poultry Farmer</p>
            </div>
          </div>
          
          <div className="profile-details">
            <h3>Account Information</h3>
            <div className="detail-item">
              <span className="label">Member Since:</span>
              <span className="value">January 2024</span>
            </div>
            <div className="detail-item">
              <span className="label">Account Status:</span>
              <span className="value status-active">Active</span>
            </div>
            <div className="detail-item">
              <span className="label">Farm Type:</span>
              <span className="value">Commercial Poultry</span>
            </div>
          </div>
          
          <div className="profile-stats">
            <h3>Farm Statistics</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-number">5</span>
                <span className="stat-label">Active Flocks</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">12</span>
                <span className="stat-label">Total Recommendations</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">85%</span>
                <span className="stat-label">Cost Savings</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">30</span>
                <span className="stat-label">Days Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
