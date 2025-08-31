"use client";

import { useSession, signIn } from "next-auth/react";

export const dynamic = "force-dynamic";

export default function LockerRoomPage() {
  const session = useSession?.() ?? { status: "unauthenticated", data: null };

  if (session.status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        Loading your locker room...
      </div>
    );
  }

  if (!session.data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="max-w-md w-full p-8 bg-gray-800 rounded-xl shadow-lg text-center">
          <h1 className="text-3xl font-bold mb-4">Locker Room</h1>
          <p className="mb-6 text-gray-300">Please log in to view your locker room.</p>
          <button
            onClick={() => signIn()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  const { user } = session.data;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="max-w-md w-full p-8 bg-gray-800 rounded-xl shadow-lg text-center">
        <h1 className="text-3xl font-bold mb-4">
          Welcome to your Locker Room, {user?.name || "Player"}
        </h1>
        <p className="text-gray-300">This is your private dashboard. More features coming soon!</p>
      </div>
    </div>
  );
}
