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
  const sessionHook = useSession();
  const session = sessionHook?.data;
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.email) return;

    const fetchTeam = async () => {
      try {
        const res = await fetch(
          "https://backend.footballforeverdynasty.us/wp-json/league-api/v1/rosters?league_id=61408"
        );
        const data: Team[] = await res.json();

        const userEmail = session.user.email.toLowerCase();
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

  if (!session) {
    return <div className="text-white p-8">Loading session...</div>;
  }

  if (loading) {
    return <div className="text-white p-8">Loading your team...</div>;
  }

  if (!myTeam) {
    return <div className="text-white p-8">No team found for your email address.</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-bold mb-6">🏈 Your Locker Room</h1>
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg space-y-4">
        <h2 className="text-2xl font-semibold">Team Owner: {myTeam.owner}</h2>
        <p className="text-sm text-gray-400">Team ID: {myTeam.id}</p>
        <div>
          <h3 className="text-xl font-semibold mt-4">Players:</h3>
          <ul className="list-disc list-inside space-y-1">
            {myTeam.players.map((player, i) => (
              <li key={i}>{player}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
