export default function Navbar() {
  return (
    <nav style={{ background: '#2E7D32', color: 'white', padding: '1rem' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Poultry Feeding Platform</h1>
        <div>
          <a href="/dashboard" style={{ color: 'white', marginRight: '1rem' }}>Dashboard</a>
          <a href="/flocks" style={{ color: 'white', marginRight: '1rem' }}>Flocks</a>
          <a href="/recommendations" style={{ color: 'white', marginRight: '1rem' }}>Recommendations</a>
          <a href="/login" style={{ color: 'white' }}>Login</a>
        </div>
      </div>
    </nav>
  );
}
