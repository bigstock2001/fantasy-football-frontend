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
          <div style={styles.bannerMuted}>No commissioner news right n
