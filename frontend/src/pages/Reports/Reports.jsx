// src/pages/Reports/Reports.jsx
import React from 'react';
import './Reports.css';

const Reports = () => {
  return (
    <div className="reports">
      <h1>Reports & Analytics</h1>
      <div className="reports-container">
        <p>This page will contain various reports and analytics for your poultry farm.</p>
        <div className="coming-soon">
          <h2>Coming Soon Features:</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3> Performance Reports</h3>
              <p>Weekly, monthly, and yearly performance analysis</p>
            </div>
            <div className="feature-card">
              <h3> Cost Analysis</h3>
              <p>Feed cost breakdown and optimization suggestions</p>
            </div>
            <div className="feature-card">
              <h3> Growth Charts</h3>
              <p>Visual growth tracking and comparison charts</p>
            </div>
            <div className="feature-card">
              <h3> Export Reports</h3>
              <p>Export data to PDF, Excel, or CSV format</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
