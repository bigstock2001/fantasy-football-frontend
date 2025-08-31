export const dynamic = "force-dynamic"; // disable Next pre-render cache

type Player = { id: string; name?: string; position?: string; team?: string };
type API = { franchises: Record<string, { name: string; icon: string; players: Player[] }> };

function displayName(n?: string) {
  if (!n) return "";
  const [last, first] = n.split(",").map(s => s.trim());
  return first ? `${first} ${last}` : n;
}

async function getRosters(franchise?: string): Promise<API> {
  const qs = new URLSearchParams({
    league_id: "61408",
    year: "2025",
    week: "1",
    cache_minutes: "5",
    nocache: "1",
    ...(franchise ? { franchise } : {}),
  });
  const url = `https://backend.footballforeverdynasty.us/?rest_route=/ffd/v1/rosters&${qs}`;
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(`Roster fetch failed: ${r.status}`);
  return r.json();
}

export default async function Page() {
  // Show all teams; change to "0001" to test one team only
  const data = await getRosters();
  const teams = Object.entries(data.franchises).map(([id, f]) => ({ id, ...f }));

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ margin: "0 0 16px", fontSize: 24 }}>League Rosters</h1>
      {teams.map((t) => (
        <section key={t.id} style={{ marginBottom: 24, border: "1px solid #ddd", borderRadius: 8 }}>
          <header style={{ padding: "10px 12px", background: "#f7f7f9", display: "flex", justifyContent: "space-between" }}>
            <strong>{t.name}</strong>
            <a href={`https://www.myfantasyleague.com/2025/options?L=61408&F=${t.id}&O=07`} target="_blank">View on MFL</a>
          </header>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #eee" }}>Pos</th>
                  <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #eee" }}>Player</th>
                  <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #eee" }}>NFL</th>
                </tr>
              </thead>
              <tbody>
                {t.players.map((p) => (
                  <tr key={p.id}>
                    <td style={{ padding: 8, borderBottom: "1px solid #f1f1f1" }}>{p.position || ""}</td>
                    <td style={{ padding: 8, borderBottom: "1px solid #f1f1f1" }}>{displayName(p.name)}</td>
                    <td style={{ padding: 8, borderBottom: "1px solid #f1f1f1" }}>{p.team || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </main>
  );
}
