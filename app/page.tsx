// app/page.tsx
"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";

interface Ticket {
  id: number;
  title: string;
  description: string;
  category: string;
  summary: string;
  createdAt: string;
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(false);

  // Ticket Management States
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      fetchTickets();
    }
  }, [session]);

  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/tickets");
      const data = await res.json();
      if (Array.isArray(data)) setTickets(data);
    } catch (err) {
      console.error("Failed to fetch tickets", err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(false);
    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });
    if (res?.error) setLoginError(true);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });

    setTitle("");
    setDescription("");
    setLoading(false);
    fetchTickets();
  };

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <p>Loading DevRev Support Engine...</p>
      </div>
    );
  }

  // 1. Login View
  if (!session) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-950 text-white p-4">
        <div className="max-w-md w-full bg-slate-900 p-8 rounded-xl border border-slate-800 shadow-2xl">
          <h1 className="text-2xl font-bold mb-2 text-center text-orange-500">DevRev Support Portal</h1>
          <p className="text-slate-400 mb-6 text-sm text-center">Sign in to manage support escalations.</p>

          {loginError && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded mb-4 text-center">
              Invalid credentials. Use <strong>admin</strong> / <strong>devrev2026</strong>.
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white focus:outline-none focus:border-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white focus:outline-none focus:border-orange-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-500 text-white font-medium py-2.5 px-4 rounded transition-all"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. Full Application View
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      {/* Top Header */}
      <header className="flex justify-between items-center mb-8 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-orange-500">DevRev Support Portal</h1>
          <p className="text-xs text-slate-400">Authenticated as: {session.user?.email}</p>
        </div>
        <button
          onClick={() => signOut()}
          className="bg-slate-900 hover:bg-slate-800 text-slate-300 text-sm py-1.5 px-3 rounded border border-slate-800"
        >
          Sign Out
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Create Ticket Form */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 h-fit">
          <h2 className="text-lg font-semibold mb-4 text-white">Create Ticket (AI Auto-Triage)</h2>
          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Issue Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Payment fails on checkout"
                className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed explanation of the problem..."
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-sm font-medium py-2.5 px-4 rounded transition-all"
            >
              {loading ? "Processing AI Triage..." : "Submit Ticket"}
            </button>
          </form>
        </div>

        {/* Right Column: Active Escalations List */}
        <div className="lg:col-span-2 bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h2 className="text-lg font-semibold mb-4 text-white">Active Support Escalations</h2>
          {tickets.length === 0 ? (
            <p className="text-slate-500 text-sm italic">No support tickets found. Submit one on the left to test AI triage!</p>
          ) : (
            <div className="space-y-4">
              {tickets.map((t) => (
                <div key={t.id} className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-white">{t.title}</h3>
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">
                      {t.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">{t.description}</p>
                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800/80">
                    <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider block mb-0.5">AI Summary</span>
                    <p className="text-xs text-slate-300">{t.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}








