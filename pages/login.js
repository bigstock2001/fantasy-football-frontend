// pages/login.js
import React, { useState } from "react";
import { useRouter } from "next/router";

export default function LoginPage() {
  const router = useRouter();
  const nextUrl = (router.query.next && String(router.query.next)) || "/locker-room";

  const [password, setPassword] = useState("");
  const [franchiseId, setFranchiseId] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: password || undefined,
          franchiseId: franchiseId || undefined,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      router.replace(nextUrl);
    } catch (err) {
      setError(err.message || "Login failed");
    }
  }

  return (
    <div style={styles.wrap}>
      <form onSubmit={onSubmit} style={styles.card}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Sign in</h1>
        <p style={{ margin: "8px 0 16px", color: "#6b7280" }}>
          Enter the league password (if required) and optionally choose your franchise.
        </p>

        <label style={styles.label}>
          <span>Password (if required)</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            placeholder="••••••••"
          />
        </label>

        <label style={styles.label}>
          <span>Franchise ID (optional)</span>
          <input
            type="text"
            value={franchiseId}
            onChange={(e) => setFranchiseId(e.target.value)}
            style={styles.input}
            placeholder="e.g. 0001"
          />
        </label>

        {error && <div style={styles.error}>{error}</div>}

        <button style={styles.button}>Sign in</button>
      </form>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(180deg, #0f172a 0%, #111827 100%)",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
    display: "grid",
    gap: 12,
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
    color: "#111827",
  },
  label: { display: "grid", gap: 6, fontSize: 14 },
  input: {
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 14,
  },
  button: {
    marginTop: 8,
    border: "1px solid #111827",
    background: "#111827",
    color: "#fff",
    borderRadius: 8,
    padding: "10px 12px",
    cursor: "pointer",
    fontSize: 14,
  },
  error: {
    color: "#b91c1c",
    background: "#fee2e2",
    border: "1px solid #fecaca",
    padding: "8px 10px",
    borderRadius: 8,
    fontSize: 14,
  },
};
