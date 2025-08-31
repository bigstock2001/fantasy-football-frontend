// app/roster/page.tsx
export const dynamic = "force-dynamic";

async function fetchRosters() {
  const url = "https://backend.footballforeverdynasty.us/?rest_route=/ffd/v1/rosters&league_id=61408&year=2025&week=1&nocache=1";
  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();
  return data?.franchises || {};
}

export default async function RosterPage() {
  const franchises = await fetchRosters();

  return (
    <main className="p-6 text-white max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Team Rosters – Week 1</h1>
      {Object.entries(franchises).map(([id, team]: any) => (
        <div key={id} className="mb-10 border-b border-white/20 pb-4">
          <h2 className="text-xl font-semibold mb-2">{team.name}</h2>
          {team.players && team.players.length > 0 ? (
            <ul className="list-disc pl-5">
              {team.players.map((p: any) => (
                <li key={p.id}>{p.name || p.id}</li>
              ))}
            </ul>
          ) : (
            <p className="text-white/70 italic">No players listed.</p>
          )}
        </div>
      ))}
    </main>
  );
}
