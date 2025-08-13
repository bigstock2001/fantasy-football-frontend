import { NextResponse } from "next/server";

const LEAGUE = process.env.MFL_LEAGUE_ID || "61408";
const YEAR   = process.env.MFL_YEAR || String(new Date().getFullYear());

async function mfl(type, params = {}) {
  const url = new URL(`https://api.myfantasyleague.com/${YEAR}/export`);
  url.searchParams.set("TYPE", type);
  url.searchParams.set("L", LEAGUE);
  url.searchParams.set("JSON", "1");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  const r = await fetch(url.toString(), { next: { revalidate: 60 } });
  if (!r.ok) throw new Error(`MFL ${r.status}`);
  return r.json();
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const franchise = searchParams.get("franchiseId"); // optional
  try {
    const data = await mfl("rosters", franchise ? { FRANCHISE: franchise } : {});
    const raw = data?.rosters?.franchise?.player ?? [];
    const arr = Array.isArray(raw) ? raw : [raw];
    const players = arr.map((p) => ({
      id: p.id,
      name: `Player ${p.id}`,
      position: p.position ?? "",
      team: p.team ?? "",
      status: p.status ?? "Active",
      stats: null,
    }));
    return NextResponse.json({ players });
  } catch {
    return NextResponse.json({ players: [] }, { status: 200 });
  }
}
