export default function FlockForm() {
  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <h1>Add/Edit Flock</h1>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px' }}>
        <form>
          <div style={{ marginBottom: '1rem' }}>
            <label>Flock Name</label>
            <input type="text" style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Bird Type</label>
            <select style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}>
              <option value="">Select type</option>
              <option value="broiler">Broiler</option>
              <option value="layer">Layer</option>
              <option value="local">Local Chicken</option>
            </select>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Number of Birds</label>
            <input type="number" style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Age (weeks)</label>
            <input type="number" style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" style={{ flex: 1, padding: '0.75rem', background: '#2E7D32', color: 'white', border: 'none', borderRadius: '4px' }}>
              Save Flock
            </button>
            <a href="/flocks" style={{ flex: 1, padding: '0.75rem', background: '#757575', color: 'white', border: 'none', borderRadius: '4px', textAlign: 'center', textDecoration: 'none' }}>
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
