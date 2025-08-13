// pages/locker-room.js
import { useEffect, useState } from "react";

const API_BASE = "https://backend.footballforeverdynasty.us"; // hardcoded so you can skip env vars for now

function Section({ title, data, loading, error }) {
  return (
    <section style={{ padding: "1rem", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", marginBottom: "1rem" }}>
      <h2 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "0.5rem" }}>{title}</h2>
      {loading && <p>Loading…</p>}
      {error && <p style={{ color: "salmon" }}>Error: {String(error)}</p>}
      {!loading && !error && (
        <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: 14, lineHeight: 1.4 }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </section>
  );
}

export default function LockerRoomPage() {
  const [standings, setStandings] = useState(null);
  const [roster, setRoster] = useState(null);
  const [matchups, setMatchups] = useState(null);

  const [loadingStandings, setLoadingStandings] = useState(true);
  const [loadingRoster, setLoadingRoster] = useState(true);
  const [loadingMatchups, setLoadingMatchups] = useState(true);

  const [errorStandings, setErrorStandings] = useState(null);
  const [errorRoster, setErrorRoster] = useState(null);
  const [errorMatchups, setErrorMatchups] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetcher(endpoint, setData, setLoading, setError) {
      setLoading(true);
      setError(null);
      try {
        const url = `${API_BASE}${endpoint}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) setError(err.message || String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    // Adjust endpoints to match your WP backend routes
    fetcher("/api/standings", setStandings, setLoadingStandings, setErrorStandings);
    fetcher("/api/roster", setRoster, setLoadingRoster, setErrorRoster);
    fetcher("/api/matchups", setMatchups, setLoadingMatchups, setErrorMatchups);

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ minHeight: "100vh", padding: "2rem" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <header style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.25rem" }}>🏈 Locker Room</h1>
          <p style={{ opacity: 0.8, fontSize: 16 }}>
            Live data from <code>{API_BASE}</code>
          </p>
        </header>

        <Section title="Standings" data={standings} loading={loadingStandings} error={errorStandings} />
        <Section title="Roster" data={roster} loading={loadingRoster} error={errorRoster} />
        <Section title="Matchups" data={matchups} loading={loadingMatchups} error={errorMatchups} />
      </div>
    </div>
  );
}
