// lib/api.js
const ENV_BASE = process.env.NEXT_PUBLIC_API_BASE; // optional
const CANDIDATES = [
  ...(ENV_BASE ? [ENV_BASE] : []),
  "/bff", // safe same-origin proxy through Next rewrites
];

async function fetchJSON(url, init) {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return res.json();
}

export async function apiGet(path, init) {
  let lastErr;
  for (const base of CANDIDATES) {
    try {
      const full = `${base}${path}`;
      // console.debug("apiGet ->", full);
      return await fetchJSON(full, init);
    } catch (e) {
      lastErr = e;
      // try next candidate (e.g., switch from ENV_BASE to /bff)
    }
  }
  throw lastErr || new Error("Failed to fetch");
}

export async function apiPost(path, body, init = {}) {
  let lastErr;
  for (const base of CANDIDATES) {
    try {
      const full = `${base}${path}`;
      const res = await fetch(full, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(init.headers || {}) },
        body: JSON.stringify(body ?? {}),
        ...init,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      try { return await res.json(); } catch { return {}; }
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("Failed to fetch");
}
