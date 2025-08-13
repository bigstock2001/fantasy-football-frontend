// lib/api.js
// Prefer the internal /bff proxy (rewrites point it to our API routes / WP).
// If NEXT_PUBLIC_API_BASE is set, try it first, then fall back to /bff.
const BASES = (process.env.NEXT_PUBLIC_API_BASE && process.env.NEXT_PUBLIC_API_BASE.trim())
  ? [process.env.NEXT_PUBLIC_API_BASE.trim(), "/bff"]
  : ["/bff"];

function joinUrl(...parts) {
  return parts
    .filter(Boolean)
    .map((p, i) =>
      i === 0 ? p.replace(/\/+$/, "") : p.replace(/^\/+/, "").replace(/\/+$/, "")
    )
    .join("/");
}

async function fetchJSON(url, init) {
  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText}${text ? ` – ${text.slice(0, 140)}` : ""}`);
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  const t = await res.text();
  try { return JSON.parse(t); } catch { return t; }
}

export async function apiGet(path, init = {}) {
  let lastErr;
  for (const base of BASES) {
    try {
      const url = joinUrl(base, path);
      return await fetchJSON(url, { ...init, cache: "no-store" });
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("All API bases failed");
}

export async function apiPost(path, body, init = {}) {
  let lastErr;
  const headers = { "Content-Type": "application/json", ...(init.headers || {}) };
  for (const base of BASES) {
    try {
      const url = joinUrl(base, path);
      return await fetchJSON(url, {
        method: "POST",
        headers,
        body: body != null ? JSON.stringify(body) : undefined,
        ...init,
      });
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("All API bases failed");
}
