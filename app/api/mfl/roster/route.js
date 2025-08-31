import { NextResponse } from "next/server";

const LEAGUE_ID = "61408"; // your MFL league ID
const BASE_URL = `https://www66.myfantasyleague.com/2025`;

export async function GET() {
  try {
    // 1. Get all team rosters
    const rosterRes = await fetch(`${BASE_URL}/export?TYPE=rosters&L=${LEAGUE_ID}&JSON=1`);
    const rosterData = await rosterRes.json();

    // 2. Get player database
    const playerRes = await fetch(`${BASE_URL}/export?TYPE=players&L=${LEAGUE_ID}&JSON=1`);
    const playerData = await playerRes.json();
    const playerMap = playerData.players.player.reduce((acc, player) => {
      acc[player.id] = player;
      return acc;
    }, {});

    // 3. Enrich each team with player names
    const teams = rosterData.rosters.franchise.map((team) => {
      const playerList = Array.isArray(team.player) ? team.player : [team.player];
      const enrichedPlayers = playerList.map((p) => {
        const info = playerMap[p.id] || { name: "Unknown", position: "?" };
        return {
          id: p.id,
          name: info.name,
          position: info.position,
        };
      });

      return {
        id: team.id,
        name: team.name,
        owner: team.owner_name || "Unknown",
        players: enrichedPlayers,
      };
    });

    return NextResponse.json({ teams });
  } catch (err) {
    console.error("Roster fetch failed:", err);
    return NextResponse.json({ error: "Failed to fetch roster" }, { status: 500 });
  }
}
