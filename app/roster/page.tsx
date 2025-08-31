export const dynamic = "force-dynamic"; // no Next cache

type Player = {
  id: string; name?: string; position?: string; team?: string;
};
type API = { franchises: Record<string, { name: string; icon: string; players: Player[] }> };

async function getRosters(franchise?: string) {
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
  return (await r.json()) as API;
}

function displayName(n?: string) {
  if (!n) return "";
  const [last, first] = n.split(",").map(s => s.trim());
  return first ? `${first} ${last}` : n;
}

export default async function Page() {
  // show one team first; remove franchise to render all
  const data = await getRosters("0001");
  const teams = Object.entries(data.franchises).map(([id, f]) => ({ id, ...f }));

  return (
    <main className="p-6">
      {teams.map((t) => (
        <section key={t.id} className="mb-6">
          <h2 className="text-xl font-semibold">{t.name}</h2>
          <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {t.players.map(p => (
              <li key={p.id} className="rounded-md border p-3">
                <div className="font-medium">{displayName(p.name)}</div>
                <div className="text-sm opacity-75">{p.position} · {p.team}</div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
