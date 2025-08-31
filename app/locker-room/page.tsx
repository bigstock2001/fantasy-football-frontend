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
    const fetchRoster = async () => {
      if (!session?.user?.email) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          "https://backend.footballforeverdynasty.us/wp-json/league-api/v1/rosters?league_id=61408"
        );

        const data: Team[] = await res.json();
        const userEmail = session.user.email.toLowerCase();
        const team = data.find((t) =>
          t.owner?.toLowerCase() === userEmail
        );

        if (team) setMyTeam(team);
      } catch (error) {
        console.error("Roster fetch failed", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoster();
  }, [session]);

  if (loading) return <div className="p-6 text-white">Loading roster...</div>;
  if (!session) return <div className="p-6 text-white">Not logged in.</div>;
  if (!myTeam) return <div className="p-6 text-white">No roster found.</div>;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-bold mb-6">🏈 Your Roster</h1>
      <div className="bg-gray-900 rounded-xl p-6 shadow-lg space-y-4">
        <h2 className="text-2xl font-semibold">Owner: {myTeam.owner}</h2>
        <p className="text-gray-400">Team ID: {myTeam.id}</p>
        <div>
          <h3 className="text-xl font-semibold mt-4">Players:</h3>
          <ul className="list-disc list-inside space-y-1">
            {myTeam.players.map((player, index) => (
              <li key={index}>{player}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
