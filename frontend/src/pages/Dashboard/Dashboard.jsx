export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to the Poultry Feeding Platform Dashboard!</p>
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Total Flocks</h3>
          <p className="dashboard-stat">0</p>
        </div>
        <div className="dashboard-card">
          <h3>Active Recommendations</h3>
          <p className="dashboard-stat">0</p>
        </div>
        <div className="dashboard-card">
          <h3>Cost Savings</h3>
          <p className="dashboard-stat">UGX 0</p>
        </div>
        <div className="dashboard-card">
          <h3>Flock Health</h3>
          <p className="dashboard-stat">Good</p>
        </div>
      </div>
      
      <div className="recent-activity" style={{ marginTop: '2rem' }}>
        <h2>Recent Activity</h2>
        <div className="activity-list">
          <p>No recent activity. Start by adding your first flock!</p>
        </div>
      </div>
    </div>
  );
}
