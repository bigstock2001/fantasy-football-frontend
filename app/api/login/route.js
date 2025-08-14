// app/api/login/route.js
import { NextResponse } from "next/server";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

function setCookie(res, name, value) {
  res.cookies.set(name, value, {
    path: "/",
    httpOnly: false,              // set true if you won't read on client
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,   // 1 year
  });
}

export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}
  const {
    // WordPress auth (preferred)
    wpUser,
    wpAppPassword,
    // Optional: allow override from the form
    franchiseId,
    // Fallback local password (optional)
    password,
  } = body || {};

  // If WP creds provided, authenticate against your WP plugin endpoint
  if (wpUser && wpAppPassword) {
    const base = (process.env.WP_BASE || "https://backend.footballforeverdynasty.us").replace(/\/+$/, "");
    const basic = Buffer.from(`${wpUser}:${wpAppPassword}`).toString("base64");

    try {
      const r = await fetch(`${base}/wp-json/ffd/v1/auth`, {
        headers: { Authorization: `Basic ${basic}` },
        cache: "no-store",
      });
      if (!r.ok) {
        return NextResponse.json(
          { ok: false, error: `WP HTTP ${r.status}` },
          { status: 401, headers: corsHeaders() }
        );
      }
      const data = await r.json(); // expected: { ok:true, user:{...}, franchiseId:"0007" }
      const fid = franchiseId || data?.franchiseId || "";

      const res = NextResponse.json(
        { ok: true, franchiseId: fid, user: data?.user || null },
        { headers: corsHeaders() }
      );
      setCookie(res, "ffd_auth", "1");
      if (fid) setCookie(res, "ffd_franchise", fid);
      if (data?.user?.display_name) setCookie(res, "ffd_name", data.user.display_name);
      return res;
    } catch (e) {
      return NextResponse.json(
        { ok: false, error: "WP auth fetch failed" },
        { status: 502, headers: corsHeaders() }
      );
    }
  }

  // Optional fallback: single shared password (env LOGIN_PASSWORD)
  if (password) {
    const need = process.env.LOGIN_PASSWORD;
    if (need && password === need) {
      const res = NextResponse.json({ ok: true }, { headers: corsHeaders() });
      setCookie(res, "ffd_auth", "1");
      if (franchiseId) setCookie(res, "ffd_franchise", franchiseId);
      return res;
    }
    return NextResponse.json(
      { ok: false, error: "Bad password" },
      { status: 401, headers: corsHeaders() }
    );
  }

  return NextResponse.json(
    { ok: false, error: "Missing credentials" },
    { status: 400, headers: corsHeaders() }
  );
}
