export const revalidate = 0; // no cache

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const qs = new URLSearchParams(searchParams);
  if (!qs.has("league_id")) qs.set("league_id", "61408");
  if (!qs.has("year")) qs.set("year", "2025");
  if (!qs.has("week")) qs.set("week", "1");
  qs.set("cache_minutes", "5");
  qs.set("nocache", "1");

  const url = `https://backend.footballforeverdynasty.us/?rest_route=/ffd/v1/rosters&${qs.toString()}`;
  const r = await fetch(url, { cache: "no-store" });
  const data = await r.json();
  return new Response(JSON.stringify(data), {
    status: r.status,
    headers: { "content-type": "application/json" },
  });
}
