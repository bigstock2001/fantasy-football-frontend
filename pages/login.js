// pages/login.js
import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // Optional fallback if a user has no franchiseId yet:
  const [manualFranchise, setManualFranchise] = useState("");
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
      // 1) Authenticate against WordPress via our server-side proxy
      const wpRes = await fetch("/api/wp-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const wpData = await wpRes.json().catch(() => ({}));
      if (!wpRes.ok || !wpData?.ok) {
        throw new Error(wpData?.error || `Login failed (HTTP ${wpRes.status})`);
      }

      // Prefer Franchise ID from WP; fall back to manual input if provided
      const franchiseId = (wpData.franchiseId || "").trim() || manualFranchise.trim();
      if (!franchiseId) {
        throw new Error(
          "Your account has no Franchise ID yet. Ask the commish to add one or enter it manually."
        );
      }

      // 2) Set our app cookies (ffd_auth, ffd_franchise) via your existing API
      const appRes = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Your /api/login accepts { franchiseId } (password check only applies if env LOGIN_PASSWORD is set)
        body: JSON.stringify({ franchiseId }),
      });
      if (!appRes.ok) {
        throw new Error(`Could not finalize session (HTTP ${appRes.status})`);
      }

      // 3) Go where we came from (or to locker-room)
      window.location.replace(from);
    } catch (err) {
      setMsg(
        err?.message ||
          "Login failed. Check your username/password and try again."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Sign in</h1>
        <p style={{ color: "#6b7280", marginTop: 6 }}>
          Use your WordPress username & password.
        </p>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, marginTop: 14 }}>
          <label style={styles.label}>
            <span>Username</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              placeholder="johndoe"
              autoComplete="username"
              required
            />
          </label>

          <label style={styles.label}>
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </label>

          <details>
            <summary style={{ cursor: "pointer" }}>No Franchise ID on your account?</summary>
            <div style={{ marginTop: 8 }}>
              <label style={styles.label}>
                <span>Enter Franchise ID (optional fallback)</span>
                <input
                  value={manualFranchise}
                  onChange={(e) => setManualFranchise(e.target.value)}
                  style={styles.input}
                  placeholder="e.g. 0007"
                />
              </label>
              <small style={{ color: "#6b7280" }}>
                Normally this is set on your WordPress user profile by the commissioner.
              </small>
            </div>
          </details>

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
    background:
      "linear-gradient(180deg, #0ea5e9 0%, #7c3aed 50%, #111827 100%)",
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
