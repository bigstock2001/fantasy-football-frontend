// components/Layout.js
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

const styles = {
  appWrap: {
    position: "relative",
    minHeight: "100vh",
  },
  // Fixed gradient background (no Tailwind needed)
  bgRoot: {
    position: "fixed",
    inset: 0,
    zIndex: -1,
    pointerEvents: "none",
  },
  bgMain: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(180deg, #0f172a 0%, rgba(15,23,42,0.95) 50%, #0b1220 100%)",
  },
  bgGlow: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 160,
    filter: "blur(40px)",
    opacity: 0.3,
    background:
      "radial-gradient(60% 60% at 50% 0%, rgba(99,102,241,0.6), rgba(99,102,241,0) 70%)",
  },

  // Sticky top nav
  header: {
    position: "sticky",
    top: 0,
    zIndex: 40,
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(15,23,42,0.6)",
    backdropFilter: "blur(8px)",
  },
  nav: {
    maxWidth: 1120,
    margin: "0 auto",
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    color: "#fff",
    textDecoration: "none",
    fontWeight: 600,
    letterSpacing: "0.02em",
  },
  navRow: { display: "flex", gap: 8, alignItems: "center" },

  // Buttons/links
  linkBase: {
    display: "inline-block",
    padding: "8px 12px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    textDecoration: "none",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    transition: "background 120ms ease",
  },
  linkHover: { background: "rgba(255,255,255,0.12)" },
  linkActive: {
    background: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.22)",
  },
  logoutBtn: {
    background: "rgba(244,63,94,0.92)", // rose-500-ish
    border: "1px solid rgba(244,63,94,0.4)",
  },

  // Page content container
  main: { maxWidth: 1120, margin: "0 auto", padding: "24px 16px" },
};

function NavLink({ href, active, children }) {
  const [hover, setHover] = React.useState(false);
  const style = {
    ...styles.linkBase,
    ...(hover ? styles.linkHover : null),
    ...(active ? styles.linkActive : null),
  };
  return (
    <Link
      href={href}
      style={style}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
    </Link>
  );
}

export default function Layout({ children }) {
  const router = useRouter();

  const LINKS = [
    { href: "/", label: "Home" },
    { href: "/locker-room", label: "Locker Room" },
    { href: "/stats", label: "Standings" },
    { href: "/trophies", label: "Trophies" },
  ];

  return (
    <div style={styles.appWrap}>
      {/* Fixed gradient background */}
      <div style={styles.bgRoot} aria-hidden>
        <div style={styles.bgMain} />
        <div style={styles.bgGlow} />
      </div>

      {/* Sticky nav */}
      <header style={styles.header}>
        <nav style={styles.nav}>
          <Link href="/" style={styles.brand}>
            Barracks Fantasy
          </Link>
          <div style={styles.navRow}>
            {LINKS.map((l) => (
              <NavLink key={l.href} href={l.href} active={router.pathname === l.href}>
                {l.label}
              </NavLink>
            ))}
            <a
              href="/api/logout"
              style={{ ...styles.linkBase, ...styles.logoutBtn }}
            >
              Logout
            </a>
          </div>
        </nav>
      </header>

      {/* Content */}
      <main style={styles.main}>{children}</main>
    </div>
  );
}
