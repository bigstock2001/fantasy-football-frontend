// app/api/logout/route.js
import { NextResponse } from "next/server";

export async function GET(req) {
  const url = new URL(req.url);
  const dest = url.searchParams.get("redirect") || "/login";

  const res = NextResponse.redirect(new URL(dest, req.url));

  // Clear auth + franchise cookies
  res.cookies.set("ffd_auth", "", { path: "/", maxAge: 0 });
  res.cookies.set("ffd_franchise", "", { path: "/", maxAge: 0 });

  return res;
}

// Optional: support POST as well
export async function POST(req) {
  return GET(req);
}
