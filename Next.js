export default async function RostersCustom() {
  const res = await fetch(
    "https://backend.footballforeverdynasty.us/wp-json/ffd/v1/rosters?league_id=61408&year=2025&cache_minutes=5",
    { next: { revalidate: 300 } } // cache 5 min
  );
  const data = await res.json();

  return (
    <div className="max-w-6xl mx-auto p-4">
      {Object.entries(data.franchises || {}).map(([fid, fr]) => (
        <div key={fid} className="mb-6 border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            {fr.icon ? <img src={fr.icon} alt="" className="w-6 h-6" /> : null}
            <h2 className="text-xl font-semibold">{fr.name}</h2>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b p-2 text-left">Pos</th>
                <th className="border-b p-2 text-left">Player</th>
                <th className="border-b p-2 text-left">NFL</th>
                <th className="border-b p-2 text-left">Status</th>
                <th className="border-b p-2 text-left">Bye</th>
              </tr>
            </thead>
            <tbody>
              {(fr.players || []).map((p) => (
                <tr key={p.id}>
                  <td className="border-b p-2">{p.position || ""}</td>
                  <td className="border-b p-2">{p.name || `ID ${p.id}`}</td>
                  <td className="border-b p-2">{p.team || ""}</td>
                  <td className="border-b p-2">{p.status || ""}</td>
                  <td className="border-b p-2">{p.bye_week || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
