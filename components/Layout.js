// components/Layout.js
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

const LEAGUE_ID = "61408";

const styles = {
  appWrap: { position: "relative", minHeight: "100vh" },

  // Fixed gradient background
  bgRoot: { position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none" },
  bgMain: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(180deg, #0f172a 0%, rgba(15,23,42,0.95) 50%, #0b1220 100%)",
  },
  bgGlow: {
    position: "absolute",
    left: 0, right: 0, top: 0, height: 160,
    filter: "blur(40px)", opacity: 0.35,
    background:
      "radial-gradient(60% 60% at 50% 0%, rgba(99,102,241,0.6), rgba(99,102,241,0) 70%)",
  },

  // Sticky top nav
  header: {
    position: "sticky", top: 0, zIndex: 40,
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(15,23,42,0.6)",
    backdropFilter: "blur(8px)",
  },
  nav: {
    maxWidth: 1120, margin: "0 auto", padding: "12px 16px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
  },
  brand: { color: "#fff", textDecoration: "none", fontWeight: 700, letterSpacing: "0.02em" },
  row: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" },

  // Nav buttons
  linkBase: {
    display: "inline-block", padding: "8px 12px", borderRadius: 10,
    fontSize: 14, fontWeight: 600, textDecoration: "none",
    color: "#fff", border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)", transition: "background 120ms ease",
  },
  linkHover: { background: "rgba(255,255,255,0.12)" },
  linkActive: { background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.22)" },
  logoutBtn: { background: "rgba(244,63,94,0.92)", border: "1px solid rgba(244,63,94,0.4)" },

  main: { maxWidth: 1120, margin: "0 auto", padding: "24px 16px", color: "#111827" },
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
        // fallback
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
      {/* Background */}
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
            <Link href="/" passHref legacyBehavior>
              <a style={{ ...styles.linkBase, ...(router.pathname === "/" ? styles.linkActive : null) }}>
                Home
              </a>
            </Link>
            <Link href="/locker-room" passHref legacyBehavior>
              <a style={{ ...styles.linkBase, ...(router.pathname === "/locker-room" ? styles.linkActive : null) }}>
                Locker Room
              </a>
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
