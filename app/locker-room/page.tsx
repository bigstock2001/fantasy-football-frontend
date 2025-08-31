"use client";

import { useEffect, useState } from "react";

export default function LockerRoomPage() {
  const [rosters, setRosters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRosters() {
      try {
        const res = await fetch("/api/mfl/roster");
        const data = await res.json();
        setRosters(data.teams || []);
      } catch (error) {
        console.error("Failed to load rosters", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRosters();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Locker Room</h1>
      {loading ? (
        <p>Loading rosters...</p>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {rosters.map((team) => (
            <div key={team.id} className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-xl font-semibold">{team.name}</h2>
              <p className="text-sm text-gray-600 mb-2">Owner: {team.owner}</p>
              <ul className="list-disc list-inside text-sm">
                {team.players?.map((p: any) => (
                  <li key={p.id}>
                    {p.name} ({p.position})
                  </li>
                )) ?? <li>No players listed</li>}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
