export const dynamic = "force-dynamic"; // disable Next cache

type Player = { id: string; name?: string; position?: string; team?: string };
type API = { franchises: Record<string, { name: string; icon: string; players: Player[] }> };

// ⬇️ ADAPTER: API → shape your UI can use
function adapt(api: API) {
  return Object.entries(api.franchises).map(([id, f]) => ({
    id,
    title: f.name,
    icon: f.icon || "",
    players: f.players.map(p => ({
      id: p.id,
      fullName: (p.name ?? "").replace(/^([^,]+),\s*(.+)$/, "$2 $1"), // "Last, First" -> "First Last"
      pos: p.position ?? "",
      nfl: p.team ?? "",
    })),
  }));
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
  const api = await getRosters();         // or getRosters("0001") to test one team
  const teams = adapt(api);               // ⬅️ use the adapter

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ margin: "0 0 16px" }}>League Rosters</h1>
      {teams.map((t) => (
        <section key={t.id} style={{ marginBottom: 24, border: "1px solid #ddd", borderRadius: 8 }}>
          <header style={{ padding: "10px 12px", background: "#f7f7f9", display: "flex", justifyContent: "space-between" }}>
            <strong>{t.title}</strong>
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
                    <td style={{ padding: 8, borderBottom: "1px solid #f1f1f1" }}>{p.pos}</td>
                    <td style={{ padding: 8, borderBottom: "1px solid #f1f1f1" }}>{p.fullName}</td>
                    <td style={{ padding: 8, borderBottom: "1px solid #f1f1f1" }}>{p.nfl}</td>
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
