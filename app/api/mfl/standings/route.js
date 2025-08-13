import { NextResponse } from "next/server";

const MFL_BASE   = process.env.MFL_BASE   || "https://api.myfantasyleague.com";
const MFL_YEAR   = process.env.MFL_YEAR   || "2024";
const MFL_LEAGUE = process.env.MFL_LEAGUE_ID || "61408";

async function mfl(type, extra = {}) {
  const url = new URL(`${MFL_BASE}/${MFL_YEAR}/export`);
  url.searchParams.set("TYPE", type);
  url.searchParams.set("JSON", "1");
  if (MFL_LEAGUE) url.searchParams.set("L", MFL_LEAGUE);
  for (const [k, v] of Object.entries(extra)) {
    if (v != null) url.searchParams.set(k.toUpperCase(), String(v));
  }
  const r = await fetch(url.toString(), { next: { revalidate: 30 } });
  if (!r.ok) throw new Error(`MFL ${type} HTTP ${r.status}`);
  return r.json();
}

export async function GET() {
  try {
    // Join raw standings with league metadata (names, divisions)
    const [stand, league] = await Promise.all([
      mfl("leagueStandings"),
      mfl("league")
    ]);

    const franchises = league?.league?.franchises?.franchise ?? [];
    const divisions  = league?.league?.divisions?.division ?? [];

    const divNameById = Object.fromEntries(divisions.map(d => [d.id, d.name]));
    const franchiseById = Object.fromEntries(franchises.map(f => [f.id, f]));

    const rows = (stand?.leagueStandings?.franchise ?? []).map((f, i) => {
      const recStr = f.h2hwlt || `${Number(f.h2hw||0)}-${Number(f.h2hl||0)}-${Number(f.h2ht||0)}`;
      const [wins, losses, ties] = recStr.split("-").map(n => Number(n)||0);
      const info = franchiseById[f.id] || {};
      const divisionName = divNameById[info.division] || "";

      return {
        rank: i + 1,
        teamId: f.id,
        teamName: info.name || `Team ${f.id}`,
        division: divisionName,
        record: `${wins}-${losses}-${ties}`,
        wins, losses, ties,
        pointsFor: Number(f.pf || 0),
        pointsAgainst: Number(f.pa || 0),
        streak: f.strk || "-"
      };
    });

    rows.sort((a, b) => (b.wins - a.wins) || (b.pointsFor - a.pointsFor));

    return NextResponse.json(rows, {
      headers: { "cache-control": "s-maxage=30, stale-while-revalidate=120" }
    });
  } catch (e) {
    return NextResponse.json({ error: e?.message || "Failed to load standings" }, { status: 502 });
  }
}
