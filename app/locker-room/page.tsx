// app/locker-room/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface Team {
  id: number;
  name: string;
  owner: string;
  players: string[];
}

export default function LockerRoomPage() {
  const { data: session, status } = useSession();
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      const fetchRoster = async () => {
        try {
          const res = await fetch("https://backend.footballforeverdynasty.us/wp-json/league-api/v1/rosters");
          const data: Team[] = await res.json();
          const team = data.find((t) => t.owner.toLowerCase() === session.user.email?.toLowerCase());

          if (team) {
            setMyTeam(team);
          } else {
            setError("No roster found for your account.");
          }
        } catch (err) {
          console.error(err);
          setError("Failed to load roster.");
        }
      };

      fetchRoster();
    }
  }, [session, status]);

  if (status === "loading") {
    return <div className="text-white p-6">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-400 p-6">{error}</div>;
  }

  if (!myTeam) {
    return <div className="text-white p-6">No roster available yet.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex justify-center py-12 px-4">
      <div className="bg-gray-800 rounded-xl p-6 shadow-xl max-w-xl w-full">
        <h2 className="text-2xl font-bold mb-2">{myTeam.name}</h2>
        <p className="text-sm text-gray-400 mb-4">Owner: {myTeam.owner}</p>
        <ul className="space-y-2">
          {myTeam.players.map((player, index) => (
            <li key={index} className="bg-gray-700 rounded-md p-2">
              {player}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
