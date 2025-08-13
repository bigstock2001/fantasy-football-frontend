import { NextResponse } from "next/server";

// No draft date yet? Return null; the UI will show the friendly message.
export async function GET() {
  return new NextResponse("null", {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "s-maxage=30, stale-while-revalidate=300",
    },
  });
}
