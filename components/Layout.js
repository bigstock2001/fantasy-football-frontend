// components/Layout.js
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/locker-room", label: "Locker Room" },
  { href: "/stats", label: "Standings" },
  { href: "/trophies", label: "Trophies" },
];

export default function Layout({ children }) {
  const router = useRouter();

  return (
    <div className="relative min-h-screen text-white">
      {/* Fixed gradient background */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950" />
        <div
          className="absolute inset-x-0 top-0 h-40 opacity-30 blur-2xl"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 0%, rgba(99,102,241,0.5), rgba(99,102,241,0) 70%)",
          }}
        />
      </div>

      {/* Sticky top nav */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-900/60 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/" className="font-semibold tracking-wide">
            Barracks Fantasy
          </Link>
          <div className="flex items-center gap-2">
            {LINKS.map((l) => {
              const active = router.pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium border ${
                    active
                      ? "bg-white/10 border-white/20"
                      : "bg-white/5 hover:bg-white/10 border-white/10"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
            <a
              href="/api/logout"
              className="rounded-lg px-3 py-2 text-sm font-medium bg-rose-500/90 hover:bg-rose-500 border border-rose-400/30"
            >
              Logout
            </a>
          </div>
        </nav>
      </header>

      {/* Page content */}
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
