// app/api/login/route.js
import { NextResponse } from "next/server";

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",           // same-origin in practice, but permissive is fine here
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS() {
  // Handle any preflight cleanly (useful if the browser decides to preflight)
  return new NextResponse(null, { status: 204, headers: cors() });
}

export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch {
    // no body is okay; treat as empty
  }
  const { password, franchiseId } = body;

  // Optional password gate: set LOGIN_PASSWORD in env to require it
  const need = process.env.LOGIN_PASSWORD;
  if (need && password !== need) {
    return NextResponse.json(
      { ok: false, error: "Bad password" },
      { status: 401, headers: cors() }
    );
  }

  const res = NextResponse.json({ ok: true }, { headers: cors() });

  // auth cookie
  res.cookies.set("ffd_auth", "1", {
    path: "/",
    httpOnly: false, // set true if you don't need to read it client-side
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
  });

  // remember franchise (optional)
  if (franchiseId) {
    res.cookies.set("ffd_franchise", franchiseId, {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return res;
}
