// app/locker-room/page.tsx
"use client";

import { useEffect, useState } from "react";

export const dynamic = "force-dynamic";

interface Player {
  id: string;
  name: string;
  position: string;
  team: string;
}

interface Franchise {
  name: string;
  icon: string;
  players: Player[];
}

interface FranchiseData {
  franchises: Record<string, Franchise>;
}

export default function LockerRoomPage() {
  const [data, setData] = useState<FranchiseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRosters() {
      try {
        const res = await fetch("/api/rosters");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to fetch rosters:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchRosters();
  }, []);

  if (loading) return <p className="text-white">Loading rosters...</p>;
  if (!data) return <p className="text-red-500">Failed to load data</p>;

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8 space-y-6">
      <h1 className="text-4xl font-bold text-center mb-8">Locker Room</h1>

      {Object.entries(data.franchises).map(([id, team]) => (
        <div
          key={id}
          className="border border-white rounded-lg p-4 bg-gray-900 shadow-md"
        >
          <h2 className="text-2xl font-bold mb-2">{team.name}</h2>
          {team.players.length > 0 ? (
            <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {team.players.map((player) => (
                <li
                  key={player.id}
                  className="bg-gray-800 p-2 rounded text-sm"
                >
                  <span className="block font-semibold">{player.name}</span>
                  <span className="text-gray-400 text-xs">
                    {player.position} — {player.team}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No players on roster.</p>
          )}
        </div>
      ))}
    </div>
  );
}
