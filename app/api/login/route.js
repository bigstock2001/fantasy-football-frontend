// app/api/login/route.js
import { NextResponse } from "next/server";

// Optional: set LOGIN_PASSWORD in Vercel env to require a password.
// If not set, any submit will log in.
export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}
  const { password, franchiseId } = body;

  const required = process.env.LOGIN_PASSWORD;
  if (required && password !== required) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  // auth cookie (httpOnly)
  res.cookies.set("ffd_auth", "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  // remember franchise if provided (non-HttpOnly so client can read it)
  if (franchiseId) {
    res.cookies.set("ffd_franchise", String(franchiseId), {
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 180, // 6 months
    });
  }
  return res;
}
