export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to the Poultry Feeding Platform Dashboard!</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Total Flocks</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2E7D32' }}>0</p>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Active Recommendations</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#FF9800' }}>0</p>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Cost Savings</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2196F3' }}>UGX 0</p>
        </div>
      </div>
    </div>
  );
}
