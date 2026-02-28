// src/pages/Notifications/Notifications.jsx
import React, { useState } from 'react';
import './Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New feed recommendation ready',
      message: 'Your AI-generated feed formulation for Flock #1 is now available.',
      time: '2 hours ago',
      read: false,
      type: 'info'
    },
    {
      id: 2,
      title: 'Low inventory alert',
      message: 'Maize stock is below 20%. Consider restocking soon.',
      time: '5 hours ago',
      read: true,
      type: 'warning'
    },
    {
      id: 3,
      title: 'Weekly report generated',
      message: 'Your weekly performance report for Jan 15-21 is ready to view.',
      time: '1 day ago',
      read: true,
      type: 'success'
    },
    {
      id: 4,
      title: 'System update',
      message: 'New features added: Cost analysis and export functionality.',
      time: '2 days ago',
      read: true,
      type: 'info'
    }
  ]);

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="notifications">
      <div className="notifications-header">
        <h1>Notifications</h1>
        <div className="header-actions">
          <span className="badge">{unreadCount} unread</span>
          <button 
            onClick={markAllAsRead}
            className="mark-all-btn"
            disabled={unreadCount === 0}
          >
            Mark all as read
          </button>
        </div>
      </div>

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <p>No notifications yet.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div 
              key={notification.id}
              className={`notification-item ${notification.read ? 'read' : 'unread'} ${notification.type}`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="notification-icon">
                {notification.type === 'warning' && ''}
                {notification.type === 'success' && ''}
                {notification.type === 'info' && ''}
              </div>
              <div className="notification-content">
                <h3>{notification.title}</h3>
                <p>{notification.message}</p>
                <span className="notification-time">{notification.time}</span>
              </div>
              {!notification.read && <div className="unread-dot"></div>}
            </div>
          ))
        )}
      </div>

      <div className="notifications-footer">
        <p>Notifications help you stay updated with your farm's activities.</p>
      </div>
    </div>
  );
};

export default Notifications;
