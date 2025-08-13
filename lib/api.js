const ENV_BASE = process.env.NEXT_PUBLIC_API_BASE; // e.g. https://backend.footballforeverdynasty.us
// Try env first, then the safe /bff proxy rewrites (see next.config.js)
const BASES = ENV_BASE ? [ENV_BASE, "/bff"] : ["/bff"];

const PREFIXES_IN_ORDER = [
  "",                      // e.g. /standings
  "/wp-json/ffd/v1",       // common custom namespace
  "/wp-json/ffd/v2",
  "/wp-json/api/v1",
  "/wp-json/wp/v2",        // core WP REST
  "/api"
];

let cachedBase = null;   // cache the first success
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

async function tryFetch(path, init, isPost, body) {
  // Use cached working pair first
  if (cachedBase && cachedPrefix) {
    const url = joinUrl(cachedBase, cachedPrefix, path);
    try {
      if (isPost) {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
          body: JSON.stringify(body ?? {}),
          ...init,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
        try { return await res.json(); } catch { return {}; }
      } else {
        return await fetchJSON(url, init);
      }
    } catch (e) {
      // fall through and probe others
    }
  }

  let lastErr;
  for (const base of BASES) {
    for (const prefix of PREFIXES_IN_ORDER) {
      const url = joinUrl(base, prefix, path);
      try {
        if (isPost) {
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
            body: JSON.stringify(body ?? {}),
            ...init,
          });
          if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
          cachedBase = base; cachedPrefix = prefix;
          try { return await res.json(); } catch { return {}; }
        } else {
          const data = await fetchJSON(url, init);
          cachedBase = base; cachedPrefix = prefix;
          return data;
        }
      } catch (e) { lastErr = e; }
    }
  }
  throw lastErr || new Error("Failed to fetch");
}

export async function apiGet(path, init) {
  return tryFetch(path, init, false);
}

export async function apiPost(path, body, init = {}) {
  return tryFetch(path, init, true, body);
}
