import { NextResponse } from "next/server";

// Return empty by default; your banner will say “No commissioner news right now.”
export async function GET() {
  return NextResponse.json({}, {
    headers: { "cache-control": "s-maxage=30, stale-while-revalidate=300" },
  });
}
