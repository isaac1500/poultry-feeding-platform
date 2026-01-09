export default function Progress() {
  return (
    <div>
      <h1>Progress Tracking</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px' }}>
          <h3>Weight Gain Chart</h3>
          <div style={{ height: '200px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1rem' }}>
            Chart will appear here
          </div>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px' }}>
          <h3>Feed Efficiency</h3>
          <div style={{ height: '200px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1rem' }}>
            Chart will appear here
          </div>
        </div>
      </div>
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', marginTop: '2rem' }}>
        <h3>Recent Measurements</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Date</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Flock</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Avg. Weight</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Feed Consumed</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '0.5rem' }}>No data yet</td>
              <td style={{ padding: '0.5rem' }}>-</td>
              <td style={{ padding: '0.5rem' }}>-</td>
              <td style={{ padding: '0.5rem' }}>-</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
