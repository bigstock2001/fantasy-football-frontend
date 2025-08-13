export default function Section({ title, right, children, loading, error, data }) {
  return (
    <section style={{
      padding: '1rem',
      borderRadius: 12,
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      marginBottom: '1rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.5rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{title}</h2>
        {right ?? null}
      </div>

      {loading ? <p>Loading…</p> : null}
      {error ? <p style={{ color: 'salmon' }}>Error: {String(error)}</p> : null}

      {/* If a parent passed raw data/flags, fall back to a JSON view; otherwise render children */}
      {!loading && !error ? (
        children ?? (
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 14 }}>
            {data !== undefined ? JSON.stringify(data, null, 2) : null}
          </pre>
        )
      ) : null}
    </section>
  );
}
