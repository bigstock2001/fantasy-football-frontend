// app/api/login/route.js
import { NextResponse } from "next/server";

export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch {}
  const { username, password } = body || {};
  if (!username || !password) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }

  // TODO: replace this stub with your real auth check
  // For now, accept any non-empty username/password.
  const res = NextResponse.json({ ok: true, user: { username } });
  res.cookies.set("ffd_session", "yes", {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}
