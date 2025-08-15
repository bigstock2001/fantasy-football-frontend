// app/api/login/route.js
import { NextResponse } from "next/server";

export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}
  const { franchiseId } = body || {};

  if (!franchiseId) {
    return NextResponse.json({ ok: false, error: "Missing franchiseId" }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true });

  // session cookie
  res.cookies.set("ffd_auth", "1", {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
  });

  // remember franchise
  res.cookies.set("ffd_franchise", String(franchiseId), {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
  });

  return res;
}
