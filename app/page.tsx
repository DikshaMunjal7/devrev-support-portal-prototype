// app/page.tsx
"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function HomePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 text-white">
        <p>Loading DevRev Portal...</p>
      </div>
    );
  }

  // 1. Unauthenticated View (Login Prompt)
  if (!session) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-900 text-white p-4">
        <div className="max-w-md w-full bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-700 text-center">
          <h1 className="text-2xl font-bold mb-2">DevRev Support Portal</h1>
          <p className="text-slate-400 mb-6 text-sm">Please sign in to access engineering support tickets.</p>
          <button
            onClick={() => signIn()}
            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-medium py-2.5 px-4 rounded-lg transition-all"
          >
            Sign In (Admin / Engineer)
          </button>
        </div>
      </div>
    );
  }

  // 2. Authenticated Dashboard View
  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <header className="flex justify-between items-center mb-8 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold">DevRev Support Portal</h1>
          <p className="text-xs text-slate-400">Logged in as: {session.user?.email}</p>
        </div>
        <button
          onClick={() => signOut()}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm py-1.5 px-3 rounded border border-slate-700"
        >
          Sign Out
        </button>
      </header>

      {/* Put your existing tickets table / UI here */}
      <div className="bg-slate-900 p-6 rounded-lg border border-slate-800">
        <h2 className="text-lg font-semibold mb-4">Active Support Escalations</h2>
        <p className="text-slate-400 text-sm">Authenticated session active. Prototype fully operational.</p>
      </div>
    </main>
  );
}















