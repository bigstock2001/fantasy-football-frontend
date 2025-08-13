import { NextResponse } from "next/server";

const BASE = process.env.MFL_BASE || "https://api.myfantasyleague.com";
const YEAR = process.env.MFL_YEAR || "2025";
const LEAGUE = process.env.MFL_LEAGUE_ID || "61408";

async function mfl(type, params = {}) {
  const url = new URL(`${BASE}/${YEAR}/export`);
  url.searchParams.set("TYPE", type);
  url.searchParams.set("JSON", "1");
  if (LEAGUE) url.searchParams.set("L", LEAGUE);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k.toUpperCase(), v);
  const r = await fetch(url.toString(), { next: { revalidate: 30 } });
  if (!r.ok) throw new Error(`MFL ${type} HTTP ${r.status}`);
  return r.json();
}

export async function GET() {
  try {
    const [league, standings] = await Promise.all([
      mfl("league"),
      mfl("leagueStandings"),
    ]);

    const divisions = Object.fromEntries(
      (league?.league?.divisions?.division || []).map(d => [d.id, d.name])
    );
    const franchises = league?.league?.franchises?.franchise || [];
    const nameById = Object.fromEntries(franchises.map(f => [f.id, f.name]));
    const divById  = Object.fromEntries(franchises.map(f => [f.id, f.division]));

    const rows = (standings?.leagueStandings?.franchise || []).map((f, i) => ({
      teamId: f.id,
      teamName: nameById[f.id] || f.id,
      record: `${Number(f.h2hw||0)}-${Number(f.h2hl||0)}-${Number(f.h2ht||0)}`,
      pointsFor: num(f.pf),
      pointsAgainst: num(f.pa),
      streak: f.strk || "-",
      division: divisions[divById[f.id]] || "-",
    }));

    return NextResponse.json(rows, {
      headers: { "cache-control": "s-maxage=30, stale-while-revalidate=300" },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 502 });
  }
}

function num(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n : 0;
}
