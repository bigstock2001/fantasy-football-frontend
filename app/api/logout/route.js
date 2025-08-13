// app/api/logout/route.js
import { NextResponse } from "next/server";

export async function GET() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("ffd_auth", "", { path: "/", maxAge: 0 });
  res.cookies.set("ffd_franchise", "", { path: "/", maxAge: 0 });
  return res;
}
