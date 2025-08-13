import { NextResponse } from "next/server";

const LEAGUE = process.env.MFL_LEAGUE_ID || "61408";
const YEAR   = process.env.MFL_YEAR || String(new Date().getFullYear());

async function mfl(type, params = {}) {
  const url = new URL(`https://api.myfantasyleague.com/${YEAR}/export`);
  url.searchParams.set("TYPE", type);
  url.searchParams.set("L", LEAGUE);
  url.searchParams.set("JSON", "1");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  const r = await fetch(url.toString(), { next: { revalidate: 15 } });
  if (!r.ok) throw new Error(`MFL ${r.status}`);
  return r.json();
}

function nameMap(leagueJson) {
  const fr = leagueJson?.league?.franchises?.franchise ?? [];
  const out = {};
  (Array.isArray(fr) ? fr : [fr]).forEach((f) => (out[f.id] = f.name));
  return out;
}

export async function GET() {
  try {
    const [live, league] = await Promise.all([
      mfl("liveScoring", { W: "YTD" }),
      mfl("league"),
    ]);
    const names = nameMap(league);
    const games = Array.isArray(live?.liveScoring?.matchup)
      ? live.liveScoring.matchup
      : [];

    const out = games.map((g, i) => {
      const teams = Array.isArray(g.franchise) ? g.franchise : [g.franchise].filter(Boolean);
      const a = teams[0], b = teams[1];
      const home = a?.isHome === "1" ? a : b;
      const away = a?.isHome === "1" ? b : a;
      return {
        id: g.id || i,
        home: { name: names[home?.id] || home?.id || "Home", score: Number(home?.score ?? 0) },
        away: { name: names[away?.id] || away?.id || "Away", score: Number(away?.score ?? 0) },
        status: g?.isLive === "1" ? "Live" : "Scheduled",
        kickoff: g?.kickoff ? new Date(Number(g.kickoff) * 1000).toISOString() : null,
      };
    });

    return NextResponse.json(out, {
      headers: { "cache-control": "s-maxage=15, stale-while-revalidate=120" },
    });
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
