import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Welcome to the Locker Room</h1>
      <ul>
        <li><Link href="/login">Login</Link></li>
        <li><Link href="/stats">Stats</Link></li>
        <li><Link href="/trophies">Trophies</Link></li>
      </ul>
    </div>
  );
}
