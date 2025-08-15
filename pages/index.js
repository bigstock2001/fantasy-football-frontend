// pages/index.js
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Index() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/locker-room");
  }, [router]);

  // Tiny fallback while redirecting
  return <div style={{ padding: 16, fontFamily: "system-ui" }}>Loading…</div>;
}
