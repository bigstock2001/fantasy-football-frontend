import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const leagueId  = searchParams.get("leagueId") || process.env.MFL_LEAGUE_ID || "61408";
  const franchise = searchParams.get("franchise") || process.env.MFL_DEFAULT_FRANCHISE || "0001";
  const base = process.env.MFL_BASE || "https://api.myfantasyleague.com";
  const year = process.env.MFL_YEAR || "2025";

  try {
    const url = `${base}/${year}/export?TYPE=rosters&L=${leagueId}&FRANCHISE=${franchise}&JSON=1`;
    const r = await fetch(url, { next: { revalidate: 30 } });
    const data = await r.json().catch(() => null);

    const raw =
      data?.rosters?.franchise?.player ||
      data?.rosters?.franchise?.roster?.player || [];

    const players = Array.isArray(raw)
      ? raw.map((p) => ({
          id: p.id,
          name: p.name || String(p.id),
          position: p.position || p.pos || "",
          team: p.team || p.nfl_team || "",
          status: p.status || "",
          stats: undefined,
        }))
      : [];

    return NextResponse.json(
      { players },
      { headers: { "cache-control": "s-maxage=30, stale-while-revalidate=120" } }
    );
  } catch {
    // Return a safe empty payload instead of a 404 so the UI shows "No roster yet."
    return NextResponse.json({ players: [] });
  }
}
