import { GetServerSideProps } from "next";

type Player = { id: string; name?: string; position?: string; team?: string };
type API = { franchises: Record<string, { name: string; icon: string; players: Player[] }> };

export const getServerSideProps: GetServerSideProps = async () => {
  const qs = new URLSearchParams({
    league_id: "61408",
    year: "2025",
    week: "1",
    cache_minutes: "5",
    nocache: "1",
    franchise: "0001" // change/remove as needed
  });
  const url = `https://backend.footballforeverdynasty.us/?rest_route=/ffd/v1/rosters&${qs}`;
  const r = await fetch(url, { cache: "no-store" });
  const data = (await r.json()) as API;
  return { props: { data } };
};

function displayName(n?: string) {
  if (!n) return "";
  const [last, first] = n.split(",").map(s => s.trim());
  return first ? `${first} ${last}` : n;
}

export default function Roster({ data }: { data: API }) {
  const teams = Object.entries(data.franchises).map(([id, f]) => ({ id, ...f }));
  return (
    <main style={{ padding: 24 }}>
      {teams.map(t => (
        <section key={t.id} style={{ marginBottom: 24 }}>
          <h2>{t.name}</h2>
          <ul>
            {t.players.map(p => (
              <li key={p.id}>{displayName(p.name)} — {p.position} · {p.team}</li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
