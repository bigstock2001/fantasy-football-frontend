// pages/locker-room.js
import React, { useEffect, useMemo, useState } from "react";
import Section from "../components/Section";
import MessageBoard from "../components/MessageBoard";
import { apiGet } from "../lib/api"; // expects apiGet(path) -> JSON (base URL handled in lib/api)

const LEAGUE_ID = "61408";

export default function LockerRoom() {
  const [standings, setStandings] = useState(null);
  const [roster, setRoster] = useState(null);
  const [matchups, setMatchups] = useState(null);
  const [banner, setBanner] = useState(null);
  const [poll, setPoll] = useState(null);
  const [countdown, setCountdown] = useState(null);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState({
    standings: true,
    roster: true,
    matchups: true,
    banner: true,
    poll: true,
    countdown: true,
  });

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
        default: break;
      }
      setErrors((e) => ({ ...e, [key]: "" }));
    } catch (e) {
      setErrors((prev) => ({ ...prev, [key]: e?.message || "Failed to load" }));
    } finally {
      setLoading((l) => ({ ...l, [key]: false }));
    }
  }

  useEffect(() => {
    // initial fetches
    safeLoad("standings", () => apiGet(`/standings?leagueId=${LEAGUE_ID}`));
    safeLoad("roster", () => apiGet(`/roster?leagueId=${LEAGUE_ID}`));
    safeLoad("matchups", () => apiGet(`/matchups?leagueId=${LEAGUE_ID}&live=1`));
    safeLoad("banner", () => apiGet(`/news/commissioner`));
    safeLoad("poll", () => apiGet(`/polls/active`));
    safeLoad("countdown", () => apiGet(`/draft/countdown`));

    // live refresh for matchups/standings
    const t = setInterval(() => {
      safeLoad("matchups", () => apiGet(`/matchups?leagueId=${LEAGUE_ID}&live=1`));
      safeLoad("standings", () => apiGet(`/standings?leagueId=${LEAGUE_ID}`));
    }, 30000);
    return () => clearInterval(t);
  }, []);

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

      {/* Roster */}
      <Section title="Your Roster">
        {loading.roster ? (
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

      {/* Matchups / Live scores */}
      <Section title="This Week’s Matchups (Live)">
        {loading.matchups ? (
          <div>Loading matchups…</div>
        ) : errors.matchups ? (
          <div style={styles.err}>Error: {errors.matchups}</div>
        ) : !Array.isArray(matchups) || matchups.length === 0 ? (
          <div>No matchups found.</div>
        ) : (
          <div style={styles.matchupsGrid}>
            {matchups.map((m, i) => (
              <div key={m.id || i} style={styles.matchCard}>
                <div style={styles.matchRow}>
                  <span style={styles.teamName}>{m.away?.name || "Away"}</span>
                  <strong style={styles.score}>{fmtScore(m.away?.score)}</strong>
                </div>
                <div style={styles.vs}>@</div>
                <div style={styles.matchRow}>
                  <span style={styles.teamName}>{m.home?.name || "Home"}</span>
                  <strong style={styles.score}>{fmtScore(m.h
