// components/MflLinks.js
import React from "react";

export default function MflLinks({ leagueId = "61408" }) {
  const [links, setLinks] = React.useState({
    homeUrl: null,
    draftUrl: null,
    error: null,
  });

  React.useEffect(() => {
    let isMounted = true;

    async function go() {
      try {
        // Use your pass-through. Ensure JSON=1 for structured data.
        const res = await fetch(`/api/mfl?type=league&L=${leagueId}&JSON=1`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`MFL meta ${res.status}`);
        const data = await res.json();

        // Defensive parsing across common shapes
        const league = data?.league ?? data;
        const baseURL =
          league?.baseURL ||
          league?.franchise?.baseURL || // fallback seen in some payloads
          null;

        const year =
          league?.history?.league?.year ||
          league?.year ||
          new Date().getFullYear();

        // Sensible fallbacks if baseURL missing
        const host = baseURL || "https://www.myfantasyleague.com";

        const homeUrl = `${host}/${year}/home/${leagueId}`;
        const draftUrl = `${host}/${year}/options?L=${leagueId}&O=17`;

        if (isMounted) setLinks({ homeUrl, draftUrl, error: null });
      } catch (err) {
        // Graceful fallback (still usable)
        const y = new Date().getFullYear();
        const host = "https://www.myfantasyleague.com";
        if (isMounted)
          setLinks({
            homeUrl: `${host}/${y}/home/${leagueId}`,
            draftUrl: `${host}/${y}/options?L=${leagueId}&O=17`,
            error: err?.message || "Failed to load MFL metadata",
          });
      }
    }

    go();
    return () => {
      isMounted = false;
    };
  }, [leagueId]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <a
        className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10"
        href={links.homeUrl || "#"}
        target="_blank"
        rel="noreferrer"
      >
        🏠 League Home
      </a>
      <a
        className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10"
        href={links.draftUrl || "#"}
        target="_blank"
        rel="noreferrer"
      >
        🧭 Draft Room
      </a>
      {!links.homeUrl && (
        <span className="text-xs opacity-70">Loading league links…</span>
      )}
      {links.error && (
        <span className="text-xs text-yellow-300">
          (Using fallback host: {links.error})
        </span>
      )}
    </div>
  );
}
