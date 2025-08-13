// app/api/mfl/roster/route.js
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const base   = process.env.MFL_BASE      || "https://api.myfantasyleague.com";
  const year   = process.env.MFL_YEAR      || "2025";
  const league = searchParams.get("leagueId") || process.env.MFL_LEAGUE_ID || "61408";
  const fran   = searchParams.get("franchiseId"); // optional

  try {
    const url = new URL(`${base}/${year}/export`);
    url.searchParams.set("TYPE", "rosters");
    url.searchParams.set("L", league);
    url.searchParams.set("JSON", "1");
    if (fran) url.searchParams.set("FRANCHISE", fran);

    const r = await fetch(url.toString(), { next: { revalidate: 60 } });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);

    const data = await r.json().catch(() => ({}));

    // Map to the minimal shape your UI expects: { players: [...] }
    const players = [];
    const franchises = data?.rosters?.franchise;
    const list = Array.isArray(franchises) ? franchises : franchises ? [franchises] : [];

    for (const f of list) {
      const ppl = Array.isArray(f.player) ? f.player : f.player ? [f.player] : [];
      for (const p of ppl) {
        players.push({
          id: p.id,
          // MFL roster export usually doesn't include name/pos/team; leaving undefined is OK for your UI
          name: p.name,
          position: p.position,
          team: p.team,
          status: p.status,
        });
      }
    }

    return NextResponse.json({ players }, {
      headers: { "cache-control": "s-maxage=60, stale-while-revalidate=300" },
    });
  } catch {
    // Never 404 to the UI—just return an empty list so it shows "No roster yet."
    return NextResponse.json({ players: [] }, { status: 200 });
  }
}
