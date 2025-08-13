import { NextResponse } from "next/server";

// Minimal stub so the UI shows an empty roster instead of 404.
// Later, fetch MFL rosters and return { players: [...] } with fields your UI uses.
export async function GET() {
  return NextResponse.json({ players: [] }, {
    headers: { "cache-control": "s-maxage=60, stale-while-revalidate=300" },
  });
}
