// app/api/wp-login/route.js
import { NextResponse } from "next/server";

const WP_BASE =
  process.env.WP_BASE?.replace(/\/+$/, "") ||
  "https://backend.footballforeverdynasty.us";

// This is the endpoint your WP plugin exposes.
// If your plugin route is different, update it here.
const WP_LOGIN_URL = `${WP_BASE}/wp-json/ffd/v1/login`;

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

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

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors() });
}

export async function POST(req) {
  // Get username/password from client
  let body = {};
  try { body = await req.json(); } catch {}
  const { username, password } = body || {};

  if (!username || !password) {
    return NextResponse.json(
      { ok: false, error: "Missing username or password" },
      { status: 400, headers: cors() }
    );
    // NOTE: If your WP expects different field names, we try them below anyway,
    // but we still require the client to send both values.
  }

  // Try multiple field-name variants and encodings (plugins differ)
  const variants = [
    { username, password },
    { user_login: username, user_pass: password },
    { log: username, pwd: password },
    { user: username, pass: password },
  ];

  let last = { status: 500, data: { error: "No attempt made" } };

  for (const payload of variants) {
    for (const sender of [postJson, postForm]) {
      let r, data;
      try {
        r = await sender(WP_LOGIN_URL, payload);
        const ct = r.headers.get("content-type") || "";
        data = ct.includes("application/json") ? await r.json() : { message: await r.text() };
      } catch (e) {
        last = { status: 502, data: { error: e?.message || "Upstream error" } };
        continue;
      }

      if (r.ok && (data?.ok ?? true)) {
        // WordPress plugin should return the user context. We look for franchiseId.
        const franchiseId =
          data?.franchiseId ||
          data?.franchise_id ||
          data?.meta?.franchiseId ||
          null;

        // Issue app cookies so middleware lets the user in.
        const res = NextResponse.json(
          { ok: true, franchiseId },
          { status: 200, headers: cors() }
        );

        res.cookies.set("ffd_auth", "1", {
          path: "/",
          httpOnly: false,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 365,
        });

        if (franchiseId) {
          res.cookies.set("ffd_franchise", String(franchiseId), {
            path: "/",
            httpOnly: false,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 365,
          });
        }

        return res;
      }

      last = { status: r.status, data };
    }
  }

  const msg =
    last?.data?.error ||
    last?.data?.message ||
    `Login failed (HTTP ${last?.status || 400})`;
  return NextResponse.json({ ok: false, error: msg }, { status: last.status || 400, headers: cors() });
}
