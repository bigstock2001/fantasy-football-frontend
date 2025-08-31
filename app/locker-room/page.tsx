// app/locker-room/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Team = {
  id: number;
  owner: string;
  players: string[];
};

export default function LockerRoom() {
  const { data: session } = useSession();
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      if (!session?.user?.email) return;

      try {
        const res = await fetch(
          "https://backend.footballforeverdynasty.us/wp-json/league-api/v1/rosters?league_id=61408"
        );
        const data: Team[] = await res.json();

        const userEmail = session?.user?.email?.toLowerCase();
        const team = data.find((t) => t.owner?.toLowerCase() === userEmail);

        if (team) setMyTeam(team);
      } catch (err) {
        console.error("Error fetching team:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [session]);

  if (loading) return <div className="p-8 text-white">Loading your team...</div>;
  if (!myTeam) return <div className="p-8 text-white">No team found for your email.</div>;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-bold mb-4">🏈 Your Locker Room</h1>
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-2">Team Owner: {myTeam.owner}</h2>
        <p className="mb-2 text-gray-400">Team ID: {myTeam.id}</p>
        <h3 className="text-xl font-semibold mt-4 mb-2">Players:</h3>
        <ul className="list-disc list-inside space-y-1">
          {myTeam.players.map((player, index) => (
            <li key={index}>{player}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
