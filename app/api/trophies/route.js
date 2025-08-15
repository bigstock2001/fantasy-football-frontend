// app/api/trophies/route.js
export const dynamic = "force-dynamic"; // don't cache at build

export async function GET() {
  const now = new Date();
  const y = now.getFullYear();

  // Seed data — edit freely or replace later
  const body = {
    champions: [
      { year: y - 2, team: "Alpha Wolves", owner: "J. Smith", record: "10-3", note: "Back-to-back finals" },
      { year: y - 1, team: "Barracks Ballers", owner: "K. Johnson", record: "11-2", note: "Top PF" },
    ],
    records: [
      { name: "Highest Weekly Score", value: "214.7", holder: "Barracks Ballers", when: `${y - 1}, Wk 7`, note: "" },
      { name: "Most Points in a Season", value: "1834.3", holder: "Alpha Wolves", when: `${y - 2}`, note: "" },
      { name: "Longest Win Streak", value: "8", holder: "Gridiron Goats", when: `${y - 3}`, note: "" },
    ],
    awards: [
      { year: y - 1, title: "Regular Season Champ", recipient: "Barracks Ballers", note: "Best record" },
      { year: y - 1, title: "Rookie GM", recipient: "Silver Knights", note: "Breakout season" },
      { year: y - 2, title: "Comeback Team", recipient: "Thunderhawks", note: "From last to playoffs" },
    ],
  };

  return Response.json(body, {
    headers: { "Cache-Control": "no-store" },
  });
}
