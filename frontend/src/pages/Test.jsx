export default function TestPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Test Page</h1>
      <p>If you can see this, React is working!</p>
      <p>Current time: {new Date().toLocaleTimeString()}</p>
    </div>
  );
}
