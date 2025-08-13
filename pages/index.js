// pages/index.js
import Link from "next/link";

export default function Home() {
  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: "0 16px",
                   fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif" }}>
      <h1 style={{ fontSize: 36, marginBottom: 16 }}>Welcome to Football Forever Dynasty</h1>
      <p style={{ marginBottom: 12 }}>
        Choose a section below:
      </p>
      <ul style={{ lineHeight: 1.8 }}>
        <li><Link href="/locker-room">Locker Room</Link></li>
        <li><Link href="/stats">Stats</Link></li>
        <li><Link href="/trophies">Trophies</Link></li>
        <li><Link href="/login">Login</Link></li>
      </ul>
    </main>
  );
}
