"use client";

import { useSession } from "next-auth/react";

export const dynamic = "force-dynamic";

export default function LockerRoomPage() {
  const session = useSession();

  // Handle loading state
  if (session.status === "loading") {
    return <div className="p-6 text-white">Loading your locker room...</div>;
  }

  // Handle unauthenticated state
  if (!session.data) {
    return (
      <div className="p-6 text-white">
        <h1 className="text-2xl font-bold">Locker Room</h1>
        <p>Please log in to view your locker room.</p>
      </div>
    );
  }

  // Extract user info once we know it's defined
  const { user } = session.data;

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold">
        Welcome to your Locker Room, {user?.name || "Player"}
      </h1>
      <p className="mt-2 text-gray-300">
        This is your private dashboard. More features coming soon!
      </p>
    </div>
  );
}
