// lib/api.js
const BASE =
  process.env.NEXT_PUBLIC_API_BASE || "/bff";

export async function apiGet(path, init) {
  const res = await fetch(`${BASE}${path}`, init);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return res.json();
}

export async function apiPost(path, body, init = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
    body: JSON.stringify(body ?? {}),
    ...init,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  try { return await res.json(); } catch { return {}; }
}
