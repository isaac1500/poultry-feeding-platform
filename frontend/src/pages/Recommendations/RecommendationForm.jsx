export default function RecommendationForm() {
  return (
    <div>
      <h1>AI Feeding Recommendations</h1>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', marginTop: '1rem' }}>
        <form>
          <div style={{ marginBottom: '1rem' }}>
            <label>Select Flock</label>
            <select style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}>
              <option value="">Select a flock</option>
              <option value="1">Flock 1</option>
              <option value="2">Flock 2</option>
            </select>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Budget Constraint (UGX)</label>
            <input type="number" placeholder="e.g., 50000" style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Available Ingredients (comma separated)</label>
            <textarea placeholder="e.g., maize, soybean, fishmeal" style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem', minHeight: '100px' }} />
          </div>
          <button type="submit" style={{ width: '100%', padding: '0.75rem', background: '#2E7D32', color: 'white', border: 'none', borderRadius: '4px' }}>
            Generate Recommendation
          </button>
        </form>
      </div>
      <div style={{ marginTop: '2rem', background: 'white', padding: '2rem', borderRadius: '8px' }}>
        <h2>Previous Recommendations</h2>
        <p>No recommendations yet. Generate your first one!</p>
      </div>
    </div>
  );
}
