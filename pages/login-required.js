// pages/login-required.js
export default function LoginRequired() {
  return (
    <div style={{
      minHeight: "60vh",
      display: "grid",
      placeItems: "center",
      padding: 24
    }}>
      <div style={{
        maxWidth: 640,
        width: "100%",
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 24
      }}>
        <h1 style={{ fontSize: 28, margin: 0, marginBottom: 12 }}>You must be logged in</h1>
        <p style={{ marginTop: 0 }}>
          Please sign in to access your league pages. If you just signed out, sign back in and
          you’ll be sent to your Locker Room automatically.
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          {/* Adjust this link to your real sign-in flow if different */}
          <a href="/api/login" style={btnPrimary}>Sign in</a>
          <a href="/" style={btnGhost}>Go home</a>
        </div>
      </div>
    </div>
  );
}

const btnPrimary = {
  padding: "10px 14px",
  borderRadius: 8,
  background: "#111827",
  color: "#fff",
  textDecoration: "none",
  border: "1px solid #111827",
};

const btnGhost = {
  padding: "10px 14px",
  borderRadius: 8,
  background: "#fff",
  color: "#111827",
  textDecoration: "none",
  border: "1px solid #111827",
};
