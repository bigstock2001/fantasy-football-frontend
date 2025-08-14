// pages/login.js
import { useState } from "react";

export default function LoginPage() {
  const [wpUser, setWpUser] = useState("");
  const [wpAppPassword, setWpAppPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const from =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("from") || "/locker-room"
      : "/locker-room";

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wpUser, wpAppPassword }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      window.location.replace(from);
    } catch {
      setMsg("Login failed. Check your WP username and Application Password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Sign in</h1>
        <p style={{ color: "#6b7280", marginTop: 6 }}>
          Use your WordPress username and Application Password.
        </p>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, marginTop: 14 }}>
          <label style={styles.label}>
            <span>WordPress Username</span>
            <input
              value={wpUser}
              onChange={(e) => setWpUser(e.target.value)}
              style={styles.input}
              placeholder="your-wp-username"
              autoComplete="username"
              required
            />
          </label>

          <label style={styles.label}>
            <span>Application Password</span>
            <input
              type="password"
              value={wpAppPassword}
              onChange={(e) => setWpAppPassword(e.target.value)}
              style={styles.input}
              placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
              autoComplete="current-password"
              required
            />
            <small style={{ color: "#6b7280" }}>
              Create one in WP → Users → Your Profile → Application Passwords.
            </small>
          </label>

          <button disabled={busy} style={styles.btn}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
          {msg && <div style={{ color: "#b91c1c" }}>{msg}</div>}
        </form>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(180deg, #0ea5e9 0%, #7c3aed 50%, #111827 100%)",
  },
  card: {
    width: "min(92vw, 420px)",
    background: "white",
    borderRadius: 14,
    padding: 18,
    boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
  },
  label: { display: "grid", gap: 6, fontWeight: 600 },
  input: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    fontSize: 15,
  },
  btn: {
    marginTop: 6,
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #111827",
    background: "#111827",
    color: "white",
    cursor: "pointer",
    fontWeight: 700,
  },
};
