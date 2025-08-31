"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface Team {
  name: string;
  owner: string;
  players: string[];
}

export default function LockerRoomPage() {
  const { data: session } = useSession();
  const [myTeam, setMyTeam] = useState<Team | null>(null);

  useEffect(() => {
    if (!session?.user?.email) return;

    const fetchData = async () => {
      try {
        const res = await fetch("https://backend.footballforeverdynasty.us/wp-json/league-api/v1/rosters");
        const data: Team[] = await res.json();

        const filteredTeam = data.find((team) => team.owner === session.user.email);
        setMyTeam(filteredTeam ?? null);
      } catch (error) {
        console.error("Error fetching team data:", error);
      }
    };

    fetchData();
  }, [session]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex justify-center py-12 px-4">
      {myTeam ? (
        <div className="bg-gray-800 rounded-xl p-6 shadow-xl max-w-xl w-full">
          <h2 className="text-2xl font-bold mb-2">{myTeam.name}</h2>
          <p className="text-sm text-gray-400 mb-4">Owner: {myTeam.owner}</p>
          <ul className="space-y-2">
            {myTeam.players.map((player, index) => (
              <li key={index} className="border-b border-gray-700 pb-2">{player}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-white/80">Loading your team...</p>
      )}
    </div>
  );
}
