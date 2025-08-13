// lib/api.js
const ENV_BASE = process.env.NEXT_PUBLIC_API_BASE; // e.g. https://backend.footballforeverdynasty.us
const BASES = ENV_BASE ? [ENV_BASE, "/bff"] : ["/bff"];

// try possible prefixes (custom plugin, alt api, raw root)
const PREFIXES = ["", "/wp-json/ffd/v1", "/wp-json/api/v1"];

let cachedBase = null;
let cachedPrefix = null;

function joinUrl(...parts) {
  return parts
    .filter(Boolean)
    .map((p, i) => (i === 0 ? p.replace(/\/+$/,"") : p.replace(/^\/+/,"").replace(/\/+$/,"")))
    .join("/");
}

async function fetchJSON(url, init) {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return res.json();
}

function softEmpty(path) {
  const p = path.split("?")[0] || "";
  if (p.includes("/standings")) return [];
  if (p.includes("/roster")) return { players: [] };
  if (p.includes("/matchups")) return [];
  if (p.includes("/polls")) return null;
  if (p.includes("/draft/countdown")) return null;
  return null;
}

export async function apiGet(path, init) {
  // if we already discovered a working pair, use it first
  if (cachedBase && cachedPrefix) {
    try {
      return await fetchJSON(joinUrl(cachedBase, cachedPrefix, path), init);
    } catch (_) { /* fall through and probe again */ }
  }

  // probe bases × prefixes
  let lastErr = null;
  for (const base of BASES) {
    for (const prefix of PREFIXES) {
      try {
        const json = await fetchJSON(joinUrl(base, prefix, path), init);
        cachedBase = base;
        cachedPrefix = prefix;
        return json;
      } catch (e) {
        lastErr = e;
        // continue trying other combos on 404/other failures
      }
    }
  }

  // nothing worked -> return a harmless empty shape so UI stays calm
  return softEmpty(path);
}
