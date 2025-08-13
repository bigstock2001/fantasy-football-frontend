// pages/locker-room.js
import React, { useEffect, useMemo, useState } from "react";
import Section from "../components/Section";
import MessageBoard from "../components/MessageBoard";
import { apiGet } from "../lib/api"; // expects apiGet(path) -> JSON (base URL handled in lib/api)

const LEAGUE_ID = "61408";

// --- helpers ---------------------------------------------------------
function readCookie(name) {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}
function writeCookie(name, value, days = 365) {
  if (typeof document === "undefined") return;
  const exp = new Date(Date.now() + days * 86400 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${exp}; SameSite=Lax`;
}
function fmtScore(s) {
  if (s === null || s === undefined) return "-";
  return Number.isFinite(Number(s)) ? Number(s).toFixed(1) : s;
}

// --- page ------------------------------------------------------------
export default function LockerRoom() {
  const [standings, setStandings] = useState(null);
  const [roster, setRoster] = useState(null);
  const [matchups, setMatchups] = useState(null);
  const [banner, setBanner] = useState(null);
  const [poll, setPoll] = useState(null);
  const [countdown, setCountdown] = useState(null);

  const [leagueMeta, setLeagueMeta] = useState(null); // franchises (for selector)
  const [franchiseId, setFranchiseId] = useState(null);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState({
    standings: true,
    roster: true,
    matchups: true,
    banner: true,
    poll: true,
    countdown: true,
    leagueMeta: false,
  });

  // boot franchise id from cookie
  useEffect(() => {
    const fid =
      readCookie("ffd_franchise") ||
      readCookie("franchiseId") ||
      null;
    setFranchiseId(fid);
  }, []);

  const year = useMemo(() => new Date().getFullYear(), []);
  const draftRoomUrl = useMemo(
    () => `https://www63.myfantasyleague.com/${year}/options?L=${LEAGUE_ID}&O=17`,
    [year]
  );
  const leagueHomeUrl = useMemo(
    () => `https://www63.myfantasyleague.com/${year}/home/${LEAGUE_ID}`,
    [year]
  );

  async function safeLoad(key, loader) {
    try {
      const data = await loader();
      switch (key) {
        case "standings": setStandings(data); break;
        case "roster": setRoster(data); break;
        case "matchups": setMatchups(data); break;
        case "banner": setBanner(data); break;
        case "poll": setPoll(data); break;
        case "countdown": setCountdown(data); break;
        case "leagueMeta": setLeagueMeta(data); break;
        default: break;
      }
      setErrors((e) => ({ ...e, [key]: "" }));
    } catch (e) {
      setErrors((prev) => ({ ...prev, [key]: e?.message || "Failed to load" }));
    } finally {
      setLoading((l) => ({ ...l, [key]: false }));
    }
  }

  // initial fetches that don't depend on franchise
  useEffect(() => {
    safeLoad("standings", () => apiGet(`/standings?leagueId=${LEAGUE_ID}`));
    safeLoad("banner", () => apiGet(`/news/commissioner`));
    safeLoad("poll", () => apiGet(`/polls/active`));
    safeLoad("countdown", () => apiGet(`/draft/countdown`));
  }, []);

  // fetch league meta (for selector) if we don't yet know franchise
  useEffect(() => {
    if (franchiseId) return;
    setLoading((l) => ({ ...l, leagueMeta: true }));
    (async () => {
      // Hit your MFL pass-through route to get league metadata (franchises list)
      const res = await fetch(`/api/mfl?type=league&L=${LEAGUE_ID}`, { cache: "no-store" });
      if (!res.ok) {
        setErrors((e) => ({ ...e, leagueMeta: `HTTP ${res.status}` }));
        setLoading((l) => ({ ...l, leagueMeta: false }));
        return;
      }
      const data = await res.json();
      setLeagueMeta(data);
      setLoading((l) => ({ ...l, leagueMeta: false }));
    })();
  }, [franchiseId]);

  // fetch roster & matchups when we know franchise id
  useEffect(() => {
    if (!franchiseId) return;

    setLoading((l) => ({ ...l, roster: true, matchups: true }));

    safeLoad("roster", () =>
      apiGet(`/roster?leagueId=${LEAGUE_ID}&franchiseId=${franchiseId}`)
    );

    safeLoad("matchups", () =>
      apiGet(`/matchups?leagueId=${LEAGUE_ID}&franchiseId=${franchiseId}&live=1`)
    );

    // live refresh
    const t = setInterval(() => {
      safeLoad("matchups", () =>
        apiGet(`/matchups?leagueId=${LEAGUE_ID}&franchiseId=${franchiseId}&live=1`)
      );
      safeLoad("standings", () => apiGet(`/standings?leagueId=${LEAGUE_ID}`));
    }, 30000);
    return () => clearInterval(t);
  }, [franchiseId]);

  // Only display my game if API returns league-wide matchups
  const myMatchups = useMemo(() => {
    if (!Array.isArray(matchups) || !franchiseId) return matchups;
    return matchups.filter(
      (m) => m?.home?.id === franchiseId || m?.away?.id === franchiseId
    );
  }, [matchups, franchiseId]);

  function onPickFranchise(e) {
    const fid = e.target.value || null;
    setFranchiseId(fid);
    if (fid) writeCookie("ffd_franchise", fid);
  }

  return (
    <div style={styles.page}>
      {/* Commissioner banner */}
      <div style={styles.bannerWrap}>
        {loading.banner ? (
          <div style={styles.bannerLoading}>Loading commissioner news…</div>
        ) : errors.banner ? (
          <div style={styles.bannerError}>Commissioner news: {errors.banner}</div>
        ) : banner && banner.message ? (
          <div style={styles.banner}>{banner.message}</div>
        ) : (
          <div style={styles.bannerMuted}>No commissioner news right now.</div>
        )}
      </div>

      {/* Quick links */}
      <div style={styles.quick}>
        <a href={leagueHomeUrl} target="_blank" rel="noreferrer" style={styles.linkBtn}>
          League Home (MFL)
        </a>
        <a href={draftRoomUrl} target="_blank" rel="noreferrer" style={styles.linkBtn}>
          Draft Room (MFL)
        </a>
        <a href="/api/logout" style={styles.linkBtnOutline}>Logout</a>
      </div>

      {/* Countdown */}
      <Section
        title="Draft Countdown"
        right={
          loading.countdown
            ? null
            : countdown?.targetDate
              ? <CountdownBadge date={countdown.targetDate} />
              : null
        }
      >
        {loading.countdown ? (
          <div>Loading…</div>
        ) : errors.countdown ? (
          <div style={styles.err}>Error: {errors.countdown}</div>
        ) : !countdown ? (
          <div>No draft date set yet. (Admin can set this in the backend.)</div>
        ) : (
          <div>
            <div><strong>Draft Day:</strong> {new Date(countdown.targetDate).toLocaleString()}</div>
            {countdown.note && <div style={{ marginTop: 6 }}>{countdown.note}</div>}
          </div>
        )}
      </Section>

      {/* Standings */}
      <Section title="Standings">
        {loading.standings ? (
          <div>Loading standings…</div>
        ) : errors.standings ? (
          <div style={styles.err}>Error: {errors.standings}</div>
        ) : !Array.isArray(standings) || standings.length === 0 ? (
          <div>No standings yet.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Team</th>
                  <th>Record</th>
                  <th>PF</th>
                  <th>PA</th>
                  <th>Streak</th>
                  <th>Division</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((t, i) => (
                  <tr key={t.teamId || i}>
                    <td>{i + 1}</td>
                    <td>{t.teamName || t.name}</td>
                    <td>{t.record || `${t.wins || 0}-${t.losses || 0}-${t.ties || 0}`}</td>
                    <td>{t.pointsFor ?? "-"}</td>
                    <td>{t.pointsAgainst ?? "-"}</td>
                    <td>{t.streak ?? "-"}</td>
                    <td>{t.division ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* Roster (your team only) */}
      <Section title="Your Roster">
        {!franchiseId ? (
          <div>
            <div style={{ marginBottom: 8 }}>
              Pick your franchise to view your roster. We’ll remember your choice on this device.
            </div>
            {loading.leagueMeta ? (
              <div>Loading teams…</div>
            ) : errors.leagueMeta ? (
              <div style={styles.err}>Error: {errors.leagueMeta}</div>
            ) : (
              <select onChange={onPickFranchise} defaultValue="">
                <option value="" disabled>Choose your team…</option>
                {(leagueMeta?.league?.franchises?.franchise || []).map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            )}
          </div>
        ) : loading.roster ? (
          <div>Loading roster…</div>
        ) : errors.roster ? (
          <div style={styles.err}>Error: {errors.roster}</div>
        ) : !roster || !Array.isArray(roster.players) ? (
          <div>No roster yet.</div>
        ) : (
          <ul style={styles.rosterGrid}>
            {roster.players.map((p) => (
              <li key={p.id} style={styles.playerCard}>
                <div style={styles.playerTop}>
                  <strong>{p.name}</strong>
                  <span style={styles.pos}>{p.position}</span>
                </div>
                <div style={styles.playerMeta}>
                  {p.team} • {p.status || "Active"}
                </div>
                {p.stats ? (
                  <div style={styles.playerStats}>
                    <span>PTS: {p.stats.points ?? "-"}</span>
                    <span>YDS: {p.stats.yards ?? "-"}</span>
                    <span>TD: {p.stats.td ?? "-"}</span>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Matchups / Live (your game only) */}
      <Section title="This Week’s Matchups (Live)">
        {!franchiseId ? (
          <div>Pick your team above to see your matchup.</div>
        ) : loading.matchups ? (
          <div>Loading matchups…</div>
        ) : errors.matchups ? (
          <div style={styles.err}>Error: {errors.matchups}</div>
        ) : !Array.isArray(myMatchups) || myMatchups.length === 0 ? (
          <div>No matchups set yet.</div>
        ) : (
          <div style={styles.matchupsGrid}>
            {myMatchups.map((m, i) => (
              <div key={m.id || i} style={styles.matchCard}>
                <div style={styles.matchRow}>
                  <span style={styles.teamName}>{m.away?.name || "Away"}</span>
                  <strong style={styles.score}>{fmtScore(m.away?.score)}</strong>
                </div>
                <div style={styles.vs}>@</div>
                <div style={styles.matchRow}>
                  <span style={styles.teamName}>{m.home?.name || "Home"}</span>
                  <strong style={styles.score}>{fmtScore(m.home?.score)}</strong>
                </div>
                <div style={styles.metaLine}>
                  {m.status || "Scheduled"} • {m.kickoff ? new Date(m.kickoff).toLocaleString() : ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Poll */}
      <Section title="League Poll">
        <PollBlock poll={poll} loading={loading.poll} error={errors.poll} />
      </Section>

      {/* Message Board */}
      <Section title="Message Board (Public)">
        <MessageBoard />
      </Section>
    </div>
  );
}

function CountdownBadge({ date }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const target = new Date(date).getTime();
  const diff = Math.max(0, target - now);
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const m = Math.floor((diff / (1000 * 60)) % 60);
  const s = Math.floor((diff / 1000) % 60);
  return (
    <span style={styles.badge}>
      {d}d {h}h {m}m {s}s
    </span>
  );
}

function PollBlock({ poll, loading, error }) {
  const [choice, setChoice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  async function submitVote(e) {
    e.preventDefault();
    if (!choice || !poll?.id) return;
    setSubmitting(true);
    setMsg("");
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE || "https://backend.footballforeverdynasty.us";
      const res = await fetch(`${base}/polls/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pollId: poll.id, option: choice }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      setMsg("Vote submitted!");
    } catch (e) {
      setMsg("Failed to submit vote: " + (e?.message || String(e)));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div>Loading poll…</div>;
  if (error) return <div style={styles.err}>Error: {error}</div>;
  if (!poll || !poll.question) return <div>No active poll.</div>;

  return (
    <form onSubmit={submitVote} style={{ display: "grid", gap: 10 }}>
      <div><strong>{poll.question}</strong></div>
      <div style={{ display: "grid", gap: 6 }}>
        {(poll.options || []).map((opt) => (
          <label key={opt} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="radio"
              name="poll"
              value={opt}
              onChange={() => setChoice(opt)}
            />
            {opt}
          </label>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button style={styles.btnPrimary} disabled={submitting || !choice}>
          {submitting ? "Submitting…" : "Vote"}
        </button>
        {msg && <span>{msg}</span>}
      </div>
    </form>
  );
}

const styles = {
  page: {
    maxWidth: 1000,
    margin: "20px auto",
    padding: "0 16px 40px",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
    color: "#111827",
  },
  bannerWrap: { marginBottom: 16 },
  banner: {
    background: "#fef3c7",
    border: "1px solid #f59e0b",
    color: "#92400e",
    padding: "10px 12px",
    borderRadius: 10,
    fontWeight: 600,
  },
  bannerMuted: {
    background: "#f3f4f6",
    border: "1px solid #e5e7eb",
    padding: "10px 12px",
    borderRadius: 10,
    color: "#374151",
  },
  bannerLoading: { opacity: 0.8 },
  bannerError: { color: "#b91c1c" },
  quick: { display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" },
  linkBtn: {
    padding: "8px 12px",
    borderRadius: 8,
    background: "#111827",
    color: "#fff",
    textDecoration: "none",
    border: "1px solid "#111827",
  },
  linkBtnOutline: {
    padding: "8px 12px",
    borderRadius: 8,
    background: "#fff",
    color: "#111827",
    textDecoration: "none",
    border: "1px solid "#111827",
  },
  err: { color: "#b91c1c" },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  rosterGrid: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "grid",
    gap: 10,
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
  },
  playerCard: {
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 12,
    background: "#fff",
  },
  playerTop: { display: "flex", justifyContent: "space-between", marginBottom: 4 },
  pos: {
    fontSize: 12,
    background: "#eef2ff",
    border: "1px solid #c7d2fe",
    color: "#3730a3",
    padding: "2px 6px",
    borderRadius: 6,
  },
  playerMeta: { color: "#6b7280", fontSize: 13, marginBottom: 6 },
  playerStats: { display: "flex", gap: 10, fontSize: 13 },
  matchupsGrid: {
    display: "grid",
    gap: 10,
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  },
  matchCard: {
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 12,
    background: "#fff",
    display: "grid",
    gap: 6,
  },
  matchRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  teamName: { fontWeight: 600 },
  score: { fontSize: 20 },
  vs: { textAlign: "center", color: "#6b7280" },
  metaLine: { color: "#6b7280", fontSize: 12, textAlign: "center", marginTop: 4 },
  badge: {
    display: "inline-block",
    padding: "4px 8px",
    background: "#111827",
    color: "#fff",
    borderRadius: 999,
    fontSize: 12,
  },
  btnPrimary: {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid "#111827",
    background: "#111827",
    color: "#fff",
    cursor: "pointer",
  },
};
