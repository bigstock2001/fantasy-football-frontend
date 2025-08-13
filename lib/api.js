const BASE = process.env.NEXT_PUBLIC_API_BASE || "https://backend.footballforeverdynasty.us";

export async function apiGet(path, init) {
  const res = await fetch(\\\\, init);
  if (!res.ok) throw new Error(\HTTP \ \\);
  return res.json();
}
