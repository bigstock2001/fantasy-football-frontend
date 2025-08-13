import { NextResponse } from "next/server";

// If there’s no poll yet, return empty; the UI will show “No active poll.”
export async function GET() {
  return NextResponse.json({}, {
    headers: { "cache-control": "s-maxage=30, stale-while-revalidate=300" },
  });
}
