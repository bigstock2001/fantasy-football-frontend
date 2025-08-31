"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function LockerRoomPage() {
  const { data: session, status } = useSession();
  const [myTeam, setMyTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoster = async () => {
      const res = await fetch("/api/mfl/roster");
      const data = await res.json();

      // Match team by owner name
      const myTeam = data.teams.find((team) =>
        team.owner?.toLowerCase().includes(session?.user?.name?.toLowerCase())
      );

      setMyTeam(myTeam);
      setLoading(false);
    };

    if (status === "authenticated") {
      fetchRoster();
    }
  }, [status, session?.user?.name]);

  if (status === "loading" || loading) return <div className="text-white">Loading roster...</div>;

  if (!myTeam) return <div className="text-red-500">Roster not found for your account.</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex justify-center py-12 px-4">
      <div className="bg-gray-800 rounded-xl p-6 shadow-xl max-w-xl w-full">
        <h2 className="text-2xl font-bold mb-2">{myTeam.name}</h2>
        <p className="text-sm text-gray-400 mb-4">Owner: {myTeam.owner}</p>
        <ul className="space-y-2">
          {myTeam.players.map((player) => (
            <li
              key={player.id}
              className="bg-gray-700 px-4 py-2 rounded-md shadow-sm flex justify-between"
            >
              <span>{player.name}</span>
              <span className="text-gray-400">{player.position}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
