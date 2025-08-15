// app/api/wp-login/route.js
import { NextResponse } from "next/server";

export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch {}
  const { username, password } = body || {};
  if (!username || !password) {
    return NextResponse.json(
      { ok: false, error: "Missing username or password" },
      { status: 400 }
    );
  }

  const WP_BASE =
    process.env.WP_BASE?.replace(/\/+$/, "") ||
    "https://backend.footballforeverdynasty.us";
  const url = `${WP_BASE}/wp-json/ffd/v1/login`;

  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username, password }),
      // no-cache to avoid any weird proxies
      cache: "no-store",
    });

    const ct = r.headers.get("content-type") || "";
    const data = ct.includes("application/json")
      ? await r.json()
      : { ok: false, error: await r.text() };

    // Pass through status; WP returns 200 for success, 401 for bad creds, etc.
    return NextResponse.json(data, { status: r.status });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: `Proxy error: ${e.message}` },
      { status: 502 }
    );
  }
}
