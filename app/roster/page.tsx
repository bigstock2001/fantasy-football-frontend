export const dynamic = "force-dynamic";

export default function Page() {
  const src =
    "https://backend.footballforeverdynasty.us/?rest_route=/ffd/v1/rosters_html&league_id=61408&year=2025&week=1&cache_minutes=5&nocache=1";

  return (
    <main style={{ padding: 0 }}>
      <iframe
        src={src}
        title="League Rosters"
        loading="eager"
        style={{
          width: "100%",
          minHeight: "1600px", // adjust taller/shorter as you like
          border: 0,
          display: "block",
        }}
      />
    </main>
  );
}
