export default function Section({ title, data, loading, error }) {
  return (
    <section style={{
      padding: '1rem',
      borderRadius: 12,
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      marginBottom: '1rem'
    }}>
      <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '.5rem' }}>{title}</h2>
      {loading && <p>Loading…</p>}
      {error && <p style={{ color: 'salmon' }}>Error: {String(error)}</p>}
      {!loading && !error && (
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 14 }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </section>
  );
}
