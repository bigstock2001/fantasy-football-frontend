// components/Layout.js
import React, { useMemo } from "react";

export default function Layout({ children }) {
  const leagueId = process.env.NEXT_PUBLIC_MFL_LEAGUE_ID || "61408";
  const year = useMemo(() => new Date().getFullYear(), []);
  const leagueHomeUrl = `https://www63.myfantasyleague.com/${year}/home/${leagueId}`;
  const draftRoomUrl = `https://www63.myfantasyleague.com/${year}/options?L=${leagueId}&O=17`;

  return (
    <div style={styles.app}>
      {/* Fixed page background (stays put while content scrolls) */}
      <div aria-hidden="true" style={styles.fixedBg} />

      {/* Sticky gradient navbar */}
      <header style={styles.navbar}>
        <div style={styles.navInner}>
          <a href="/" style={styles.brand}>FootballForever</a>
          <nav style={styles.navLinks}>
            <a href="/locker-room" style={styles.navBtn}>Locker Room</a>
            <a href={leagueHomeUrl} target="_blank" rel="noreferrer" style={styles.navBtn}>
              League Home (MFL)
            </a>
            <a href={draftRoomUrl} target="_blank" rel="noreferrer" style={styles.navBtn}>
              Draft Room (MFL)
            </a>
            <a href="/api/logout" style={{ ...styles.navBtn, ...styles.navBtnOutline }}>
              Logout
            </a>
          </nav>
        </div>
      </header>

      {/* Main content container */}
      <main style={styles.page}>{children}</main>
    </div>
  );
}

const styles = {
  app: { position: "relative", minHeight: "100vh" },
  fixedBg: {
    position: "fixed",
    inset: 0,
    zIndex: -1,
    background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 40%, #ffffff 100%)",
  },
  navbar: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    background: "linear-gradient(90deg, #4f46e5, #9333ea)",
    color: "#fff",
    borderBottom: "1px solid rgba(255,255,255,0.18)",
    boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
  },
  navInner: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "12px 16px",
    display: "flex",
    gap: 12,
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  brand: { fontWeight: 800, letterSpacing: 0.3, fontSize: 18, color: "#fff", textDecoration: "none" },
  navLinks: { display: "flex", gap: 8, flexWrap: "wrap" },
  navBtn: {
    display: "inline-block",
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.35)",
    textDecoration: "none",
    color: "#fff",
    background: "rgba(255,255,255,0.10)",
    whiteSpace: "nowrap",
  },
  navBtnOutline: { background: "transparent" },
  page: {
    maxWidth: 1000,
    margin: "18px auto 40px",
    padding: "0 16px 40px",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
    color: "#111827",
  },
};
