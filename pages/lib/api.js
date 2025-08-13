// lib/api.js
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

async function handle(res) {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  // allow empty 204 responses
  if (res.status === 204) return null;
  return res.json();
}

export async function apiGet(path, opts = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, { ...opts, cache: "no-store" });
  return handle(res);
}

export async function apiPost(path, body = {}, opts = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    body: JSON.stringify(body),
  });
  return handle(res);
}
