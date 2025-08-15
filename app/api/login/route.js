// app/api/wp-login/route.js
import { NextResponse } from "next/server";

const WP_BASE =
  process.env.WP_BASE?.replace(/\/+$/, "") ||
  "https://backend.footballforeverdynasty.us";
const WP_LOGIN_URL = `${WP_BASE}/wp-json/ffd/v1/login`;

async function postJson(url, payload) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  return r;
}
async function postForm(url, payload) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded", accept: "application/json" },
    body: new URLSearchParams(payload).toString(),
    cache: "no-store",
  });
  return r;
}

export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}
  const { username, password } = body || {};
  if (!username || !password) {
    return NextResponse.json(
      { ok: false, error: "Missing username or password" },
      { status: 400 }
    );
  }

  // Attempt 1: JSON
  let r = await postJson(WP_LOGIN_URL, { username, password });
  if (r.status === 400 || r.status === 415) {
    // Attempt 2: form-encoded (some WP setups only parse form data)
    r = await postForm(WP_LOGIN_URL, { username, password });
  }

  const ct = r.headers.get("content-type") || "";
  let data;
  try {
    data = ct.includes("application/json") ? await r.json() : { message: await r.text() };
  } catch {
    data = { message: "Non-JSON response" };
  }

  // Normalize and pass through
  const ok = r.ok && (data.ok ?? true);
  const out = ok
    ? { ok: true, franchiseId: data.franchiseId }
    : { ok: false, error: data.error || data.message || `HTTP ${r.status}` };

  return NextResponse.json(out, { status: r.status });
}
