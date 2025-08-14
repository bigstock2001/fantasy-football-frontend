// app/api/wp-login/route.js
import { NextResponse } from "next/server";

const WP_BASE = process.env.WP_BASE || "https://backend.footballforeverdynasty.us";

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors() });
}

export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch {
    // ignore
  }
  const { username, appPassword, franchiseId } = body || {};

  if (!username || !appPassword) {
    return NextResponse.json(
      { ok: false, error: "Missing username or appPassword" },
      { status: 400, headers: cors() }
    );
  }

  // Basic Auth using WordPress Application Password
  const basic = Buffer.from(`${username}:${appPassword}`).toString("base64");

  let r;
  try {
    r = await fetch(`${WP_BASE}/wp-json/wp/v2/users/me`, {
      headers: { Authorization: `Basic ${basic}` },
      cache: "no-store",
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: "Could not reach WordPress" },
      { status: 502, headers: cors() }
    );
  }

  if (!r.ok) {
    const text = await r.text().catch(() => "");
    return NextResponse.json(
      { ok: false, error: `WP auth failed (${r.status})`, detail: text.slice(0, 160) },
      { status: 401, headers: cors() }
    );
  }

  const user = await r.json().catch(() => null);

  const res = NextResponse.json({ ok: true, user }, { headers: cors() });

  // Session cookie (read by middleware)
  const cookieCfg = {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
  };
  res.cookies.set("ffd_auth", "1", cookieCfg);
  if (user?.id) res.cookies.set("ffd_uid", String(user.id), cookieCfg);
  if (franchiseId) res.cookies.set("ffd_franchise", franchiseId, cookieCfg);

  return res;
}
