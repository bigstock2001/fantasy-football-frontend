import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  if (!type) return NextResponse.json({ error: "Missing ?type=" }, { status: 400 });

  const base  = process.env.MFL_BASE || "https://api.myfantasyleague.com";
  const year  = searchParams.get("year") || process.env.MFL_YEAR || "2025"; // <- default 2025
  const league = process.env.MFL_LEAGUE_ID;

  const url = new URL(`${base}/${year}/export`);
  url.searchParams.set("TYPE", type);
  if (league) url.searchParams.set("L", league);
  url.searchParams.set("JSON", "1");

  // pass through other params
  for (const [k, v] of searchParams.entries()) {
    if (k !== "type" && k !== "year") url.searchParams.set(k.toUpperCase(), v);
  }

  const r = await fetch(url.toString(), { next: { revalidate: 60 } });
  const text = await r.text();
  return new NextResponse(text, {
    status: r.status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "s-maxage=60, stale-while-revalidate=300"
    },
  });
}
