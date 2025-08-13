// app/api/standings/route.js
import { NextResponse } from "next/server";

function toMap(arr, key = "id") {
  const m = new Map();
  if (Array.isArray(arr)) arr.forEach((it) => m.set(String(it[key]), it));
  return m;
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const base   = process.env.MFL_BASE || "https://api.myfantasyleague.com";
    const year   = searchParams.get("year") || process.env.MFL_YEAR || "2025";
    const league = searchParams.get("leagueId") || process.env.MFL_LEAGUE_ID;

    if (!league) {
      return NextResponse.json({ error: "Missing league id (set MFL_LEAGUE_ID or pass ?leagueId=)" }, { status: 400 });
    }

    // Build URLs
    const leagueURL = new URL(`${base}/${year}/export`);
    leagueURL.searchParams.set("TYPE", "league");
    leagueURL.searchParams.set("L", league);
    leagueURL.searchParams.set("JSON", "1");

    const standingsURL = new URL(`${base}/${year}/export`);
    standingsURL.searchParams.set("TYPE", "leagueStandings");
    standingsURL.searchParams.set("L", league);
    standingsURL.searchParams.set("JSON", "1");

    // Fetch both in parallel (cache for 60s at the edge)
    const [leagueRes, standingsRes] = await Promise.all([
      fetch(leagueURL,   { next: { revalidate: 60 } }),
      fetch(standingsURL,{ next: { revalidate: 60 } }),
    ]);

    if (!leagueRes.ok) {
      return NextResponse.json({ error: `MFL league fetch failed: ${leagueRes.status}` }, { status: 502 });
    }
    if (!standingsRes.ok) {
      return NextResponse.json({ error: `MFL standings fetch failed: ${standingsRes.status}` }, { status: 502 });
    }

    const leagueJson     = await leagueRes.json();
    const standingsJson  = await standingsRes.json();

    // Maps for quick lookups
    const franchises = leagueJson?.league?.franchises?.franchise || [];
    const divisions  = leagueJson?.league?.divisions?.division || [];
    const divById    = toMap(divisions, "id");
    const teamById   = toMap(franchises, "id");

    const rawRows = standingsJson?.leagueStandings?.franchise || [];
    const rows = rawRows.map((r) => {
      const id      = String(r.id);
      const team    = teamById.get(id) || {};
      const div     = divById.get(String(team.division)) || {};
      const wlt     = (r.h2hwlt || "0-0-0").split("-");
      const wins    = Number(wlt[0] || 0);
      const losses  = Number(wlt[1] || 0);
      const ties    = Number(wlt[2] || 0);

      return {
        teamId: id,
        teamName: team.name || id,
        divisionId: team.division || null,
        division: div.name || null,
        record: `${wins}-${losses}-${ties}`,
        wins, losses, ties,
        pointsFor: Number(r.pf || 0),
        pointsAgainst: Number(r.pa || 0),
        streak: r.strk ?? "-",
      };
    });

    // Example sort: by wins desc, then PF desc, then name
    rows.sort((a, b) =>
      b.wins - a.wins ||
      b.pointsFor - a.pointsFor ||
      String(a.teamName).localeCompare(String(b.teamName))
    );

    // Add rank after sorting
    const out = rows.map((r, i) => ({ rank: i + 1, ...r }));

    return NextResponse.json(out, {
      headers: {
        "cache-control": "s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
