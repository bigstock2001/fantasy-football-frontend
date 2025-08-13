import { NextResponse } from "next/server";

const LEAGUE = process.env.MFL_LEAGUE_ID || "61408";
const YEAR   = process.env.MFL_YEAR || String(new Date().getFullYear());

async function mfl(type, params = {}) {
  const url = new URL(`https://api.myfantasyleague.com/${YEAR}/export`);
  url.searchParams.set("TYPE", type);
  url.searchParams.set("L", LEAGUE);
  url.searchParams.set("JSON", "1");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  const r = await fetch(url.toString(), { next: { revalidate: 30 } });
  if (!r.ok) throw new Error(`MFL ${r.status}`);
  return r.json();
}

export async function GET() {
  try {
    const data = await mfl("standings");
    const list = data?.standings?.franchise ?? [];
    const rows = (Array.isArray(list) ? list : [list]).map((f) => {
      const wins = Number(f.h2hw ?? f.w ?? 0);
      const losses = Number(f.h2hl ?? f.l ?? 0);
      const ties = Number(f.h2ht ?? f.t ?? 0);
      return {
        teamId: f.id,
        teamName: f.name || f.id,
        wins, losses, ties,
        record: `${wins}-${losses}-${ties}`,
        pointsFor: Number(f.pf ?? f.p ?? 0),
        pointsAgainst: Number(f.pa ?? 0),
        streak: f.streak ?? "-",
        division: f.division_name ?? f.division ?? "-",
      };
    });
    return NextResponse.json(rows, {
      headers: { "cache-control": "s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (e) {
    return NextResponse.json([], { status: 200 });
  }
}
