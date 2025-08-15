// components/Layout.js
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

const LEAGUE_ID = "61408";

/** Tweak these 4 values to fine-tune the “blueish” vibe */
const COLORS = {
  gradStart: "#60a5fa", // blue-400
  gradMid:   "#3b82f6", // blue-500
  gradEnd:   "#06b6d4", // cyan-500
  glow:      "rgba(56,189,248,0.55)", // sky-400-ish glow
};

const styles = {
  appWrap: { position: "relative", minHeight: "100vh" },

  // Fixed blue gradient background
  bgRoot: { position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none" },
  bgMain: {
    position: "absolute",
    inset: 0,
    background: `linear-gradient(180deg, ${COLORS.gradStart} 0%, ${COLORS.gradMid} 45%, ${COLORS.gradEnd} 100%)`,
  },
  bgGlow: {
    position: "absolute",
    left: 0, right: 0, top: 0, height: 180,
    filter: "blur(40px)", opacity: 0.5,
    background: `radial-gradient(60% 60% at 50% 0%, ${COLORS.glow}, rgba(0,0,0,0) 70%)`,
  },

  // Sticky top nav
  header: {
    position: "sticky", top: 0, zIndex: 40,
    borderBottom: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(2, 22, 50, 0.28)", // subtle translucent overlay to keep text readable
    backdropFilter: "blur(10px)",
  },
  nav: {
    maxWidth: 1120, margin: "0 auto", padding: "12px 16px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
  },
  brand: {
    color: "#ffffff", textDecoration: "none", fontWeight: 800, letterSpacing: "0.02em",
    textShadow: "0 1px 2px rgba(0,0,0,0.25)",
  },
  row: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" },

  // Nav buttons
  linkBase: {
    display: "inline-block", padding: "8px 12px", borderRadius: 10,
    fontSize: 14, fontWeight: 700, textDecoration: "none",
    color: "#ffffff",
    border: "1px solid rgba(255,255,255,0.25)",
    background: "rgba(255,255,255,0.16)",
    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
    transition: "background 140ms ease, transform 120ms ease",
  },
  linkHover: { background: "rgba(255,255,255,0.26)", transform: "translateY(-1px)" },
  linkActive: { background: "rgba(255,255,255,0.36)", border: "1px solid rgba(255,255,255,0.35)" },
  logoutBtn: {
    background: "linear-gradient(180deg, rgba(244,63,94,0.95), rgba(244,63,94,0.85))",
    border: "1px solid rgba(244,63,94,0.55)",
  },

  main: { maxWidth: 1120, margin: "0 auto", padding: "24px 16px" },
};

function NavButton({ href, label, active, extraStyle }) {
  const [hover, setHover] = React.useState(false);
  const style = {
    ...styles.linkBase,
    ...(hover ? styles.linkHover : null),
    ...(active ? styles.linkActive : null),
    ...(extraStyle || {}),
  };
  return (
    <a
      href={href}
      style={style}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {label}
    </a>
  );
}

export default function Layout({ children }) {
  const router = useRouter();

  // Only on /locker-room, compute live MFL links so they’re handy in the nav too
  const [mfl, setMfl] = React.useState({
    homeUrl: null,
    draftUrl: null,
    loading: router.pathname === "/locker-room",
  });

  React.useEffect(() => {
    let alive = true;
    if (router.pathname !== "/locker-room") return;
    (async () => {
      try {
        const res = await fetch(`/api/mfl?type=league&L=${LEAGUE_ID}&JSON=1`, { cache: "no-store" });
        const data = res.ok ? await res.json() : {};
        const league = data?.league ?? data;
        const baseURL =
          league?.baseURL ||
          league?.franchise?.baseURL ||
          "https://www.myfantasyleague.com";
        const year =
          league?.history?.league?.year ||
          league?.year ||
          new Date().getFullYear();

        const homeUrl = `${baseURL}/${year}/home/${LEAGUE_ID}`;
        const draftUrl = `${baseURL}/${year}/options?L=${LEAGUE_ID}&O=17`;
        if (alive) setMfl({ homeUrl, draftUrl, loading: false });
      } catch {
        const y = new Date().getFullYear();
        const host = "https://www.myfantasyleague.com";
        if (alive) setMfl({
          homeUrl: `${host}/${y}/home/${LEAGUE_ID}`,
          draftUrl: `${host}/${y}/options?L=${LEAGUE_ID}&O=17`,
          loading: false,
        });
      }
    })();
    return () => { alive = false; };
  }, [router.pathname]);

  return (
    <div style={styles.appWrap}>
      {/* Blue gradient background */}
      <div style={styles.bgRoot} aria-hidden>
        <div style={styles.bgMain} />
        <div style={styles.bgGlow} />
      </div>

      {/* Sticky nav */}
      <header style={styles.header}>
        <nav style={styles.nav}>
          <Link href="/" style={styles.brand}>Barracks Fantasy</Link>
          <div style={styles.row}>
            {/* Only the pages you asked for */}
            <Link href="/" style={{
              ...styles.linkBase,
              ...(router.pathname === "/" ? styles.linkActive : null),
            }}>
              Home
            </Link>
            <Link href="/locker-room" style={{
              ...styles.linkBase,
              ...(router.pathname === "/locker-room" ? styles.linkActive : null),
            }}>
              Locker Room
            </Link>

            {/* Show MFL shortcuts only when on Locker Room */}
            {router.pathname === "/locker-room" && (
              <>
                <NavButton href={mfl.homeUrl || "#"} label="League Home (MFL)" />
                <NavButton href={mfl.draftUrl || "#"} label="Draft Room (MFL)" />
              </>
            )}

            <NavButton href="/api/logout" label="Logout" extraStyle={styles.logoutBtn} />
          </div>
        </nav>
      </header>

      <main style={styles.main}>{children}</main>
    </div>
  );
}
