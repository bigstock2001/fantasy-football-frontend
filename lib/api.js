// lib/api.js
const BASE = process.env.NEXT_PUBLIC_API_BASE || "/bff";

function buildUrl(path) {
  if (!path) throw new Error("path required");
  if (/^https?:\/\//i.test(path)) return path;
  return `${BASE}${path.startsWith("/") ? "" : "/"}${path}`;
}

async function fetchJSON(url, init) {
  const res = await fetch(url, {
    headers: { Accept: "application/json", ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function apiGet(path, init) {
  return fetchJSON(buildUrl(path), init);
}

export async function apiPost(path, body, init) {
  return fetchJSON(buildUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    body: JSON.stringify(body ?? {}),
    ...init,
  });
}
