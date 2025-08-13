// pages/login.js
import React, { useState, useEffect } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [next, setNext] = useState("/locker-room");

  useEffect(() => {
    const usp = new URLSearchParams(window.location.search);
    const n = usp.get("next");
    if (n) setNext(n);
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || `HTTP ${res.status}`);
      }
      // success → go to next or locker room
      window.location.href = next || "/locker-room";
    } catch (err) {
      setMsg("Login failed. Please check your credentials.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <h1 style={{ margin: 0 }}>Sign in</h1>
        <p style={{ marginTop: 8, color: "#6b7280" }}>
          {next && next !== "/locker-room"
            ? "You must be logged in to continue."
            : "Welcome back—sign in to open your Locker Room."}
        </p>
        <form onSubmit={onSubmit} style={{ marginTop: 16, display: "grid", gap: 10 }}>
          <label style={styles.label}>
            <span>Username</span>
            <input
              style={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </label>
          <label style={styles.label}>
            <span>Password</span>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          <button style={styles.btnPrimary} disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
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
    background:
      "linear-gradient(180deg, rgba(17,24,39,1) 0%, rgba(31,41,55,1) 40%, rgba(55,65,81,1) 100%)",
    display: "grid",
    placeItems: "center",
    padding: "24px",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 20,
    boxShadow:
      "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
  },
  label: { display: "grid", gap: 6, fontSize: 14 },
  input: {
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 16,
    outline: "none",
  },
  btnPrimary: {
    marginTop: 6,
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #111827",
    background: "#111827",
    color: "#fff",
    cursor: "pointer",
    fontSize: 16,
  },
};
