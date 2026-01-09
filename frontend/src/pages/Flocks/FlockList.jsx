export default function FlockList() {
  return (
    <div>
      <h1>Flocks</h1>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <p>Manage your poultry flocks here.</p>
        <a href="/flocks/new" style={{ background: '#2E7D32', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', textDecoration: 'none' }}>
          Add New Flock
        </a>
      </div>
      <div style={{ background: 'white', padding: '1rem', borderRadius: '8px' }}>
        <p>No flocks yet. Click "Add New Flock" to get started.</p>
      </div>
    </div>
  );
}
