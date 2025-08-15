// app/api/wp-login/route.js
import { NextResponse } from "next/server";

const WP_BASE =
  process.env.WP_BASE?.replace(/\/+$/, "") ||
  "https://backend.footballforeverdynasty.us";

// Your custom plugin route; change if your endpoint differs
const WP_LOGIN_URL = `${WP_BASE}/wp-json/ffd/v1/login`;

async function postJson(url, payload) {
  return fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
}
async function postForm(url, payload) {
  return fetch(url, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded", accept: "application/json" },
    body: new URLSearchParams(payload).toString(),
    cache: "no-store",
  });
}

export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}
  const { username, password } = body || {};
  if (!username || !password) {
    return NextResponse.json(
      { ok: false, error: "Missing username or password (client)" },
      { status: 400 }
    );
  }

  // Try multiple key variants + both JSON and FORM encodings
  const variants = [
    { username, password },
    { user_login: username, user_pass: password },
    { log: username, pwd: password },
    { user: username, pass: password },
  ];

  let last = { status: 500, data: { error: "No attempt made" } };

  for (const payload of variants) {
    // 1) JSON attempt
    let r = await postJson(WP_LOGIN_URL, payload);
    let data;
    try {
      const ct = r.headers.get("content-type") || "";
      data = ct.includes("application/json") ? await r.json() : { message: await r.text() };
    } catch { data = { message: "Non-JSON response" }; }

    // success?
    if (r.ok && (data.ok ?? true)) {
      return NextResponse.json(
        { ok: true, franchiseId: data.franchiseId },
        { status: 200 }
      );
    }
    // If 400/415 it might be just wrong encoding/keys; remember it and keep trying
    last = { status: r.status, data };

    // 2) FORM attempt for the same payload
    r = await postForm(WP_LOGIN_URL, payload);
    try {
      const ct = r.headers.get("content-type") || "";
      data = ct.includes("application/json") ? await r.json() : { message: await r.text() };
    } catch { data = { message: "Non-JSON response" }; }

    if (r.ok && (data.ok ?? true)) {
      return NextResponse.json(
        { ok: true, franchiseId: data.franchiseId },
        { status: 200 }
      );
    }
    last = { status: r.status, data };
  }

  // If we got here, all attempts failed: bubble up the most recent error from WP
  const msg = last.data?.error || last.data?.message || `HTTP ${last.status}`;
  return NextResponse.json({ ok: false, error: msg }, { status: last.status || 400 });
}
