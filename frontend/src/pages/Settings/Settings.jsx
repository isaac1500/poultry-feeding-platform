export default function Settings() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1>Settings</h1>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', marginTop: '1rem' }}>
        <h2>Account Settings</h2>
        <form>
          <div style={{ marginBottom: '1rem' }}>
            <label>Email</label>
            <input type="email" defaultValue="user@example.com" style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Farm Name</label>
            <input type="text" placeholder="Your farm name" style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Location</label>
            <input type="text" placeholder="e.g., Kampala, Uganda" style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
          </div>
          <button type="submit" style={{ padding: '0.75rem 2rem', background: '#2E7D32', color: 'white', border: 'none', borderRadius: '4px' }}>
            Save Changes
          </button>
        </form>
      </div>
      
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', marginTop: '2rem' }}>
        <h2>Preferences</h2>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center' }}>
            <input type="checkbox" style={{ marginRight: '0.5rem' }} />
            Receive email notifications
          </label>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center' }}>
            <input type="checkbox" style={{ marginRight: '0.5rem' }} />
            Show recommendations in local currency (UGX)
          </label>
        </div>
        <div>
          <label>Language</label>
          <select style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}>
            <option value="en">English</option>
            <option value="lg">Luganda</option>
          </select>
        </div>
      </div>
    </div>
  );
}
