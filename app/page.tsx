"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";

interface Ticket {
  id: number;
  title: string;
  description: string;
  customer?: string;
  category?: string;
  priority?: string;
  status?: string;
  summary?: string;
}

export default function HomePage() {
  const { data: session, status } = useSession();

  // Auth States
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(false);

  // Dashboard & Modal States
  const [showModal, setShowModal] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: 1,
      title: "Failure in Payment",
      description: "Failure in Payment",
      customer: "dikshamunjal7@gmail.com",
      category: "BUG",
      priority: "MEDIUM",
      status: "RESOLVED",
      summary: "Auto-triaged as BUG based on description.",
    },
    {
      id: 2,
      title: "Annual subscription discount inquiry",
      description: "User asking if there is a 20% discount for enterprise annual billing.",
      customer: "finance@corp.com",
      category: "BILLING",
      priority: "LOW",
      status: "UNTRIAGED",
      summary: "Sales inquiry regarding enterprise tier pricing.",
    },
    {
      id: 3,
      title: "Cannot process credit card payment",
      description: "Customer receives 500 error when submitting credit card checkout on payment...",
      customer: "alex@acme.com",
      category: "BUG",
      priority: "HIGH",
      status: "IN_PROGRESS",
      summary: "High-severity payment gateway error on checkout page.",
    },
  ]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [customer, setCustomer] = useState("");
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
      if (Array.isArray(data) && data.length > 0) {
        setTickets(data);
      }
    } catch (err) {
      console.error("Failed to sync tickets from API", err);
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

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, customer }),
      });
      const newTicket = await res.json();

      if (newTicket && newTicket.id) {
        setTickets((prev) => [newTicket, ...prev]);
      } else {
        fetchTickets();
      }
    } catch (err) {
      console.error("Failed to create ticket", err);
    } finally {
      setLoading(false);
      setShowModal(false);
      setTitle("");
      setDescription("");
      setCustomer("");
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );

    try {
      await fetch(`/api/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  // Metric Calculations
  const totalVolume = tickets.length;
  const untriagedCount = tickets.filter(
    (t) => t.status === "UNTRIAGED" || !t.status
  ).length;
  const highPriorityCount = tickets.filter(
    (t) => t.priority === "HIGH" || t.priority === "URGENT"
  ).length;

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0B0F19] text-white">
        <p className="text-sm text-slate-400">Loading DevRev Support Engine...</p>
      </div>
    );
  }

  // 1. LOGIN VIEW (Renders when unauthenticated at http://localhost:3000)
  if (!session) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#0B0F19] text-white p-4">
        <div className="max-w-md w-full bg-[#111827] p-8 rounded-2xl border border-slate-800 shadow-2xl">
          <h1 className="text-2xl font-bold mb-1 text-center text-white">
            DevRev Support & Escalation Portal
          </h1>
          <p className="text-slate-400 mb-6 text-xs text-center">
            Sign in to access automated AI triage and issue sync.
          </p>

          {loginError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg mb-4 text-center">
              Invalid credentials. Use <strong>admin</strong> / <strong>devrev2026</strong>.
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full bg-[#0B0F19] border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0B0F19] border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-all shadow-lg shadow-indigo-600/20"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. DASHBOARD VIEW (Exact layout from screenshot)
  return (
    <main className="min-h-screen bg-[#0B0F19] text-white p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Navigation & Header Bar */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              DevRev Support & Escalation Portal
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Automated AI Triage & Shared Memory Issue Sync
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500">
              User: <strong className="text-slate-300">{session.user?.email}</strong>
            </span>
            <button
              onClick={() => signOut()}
              className="text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg transition-all"
            >
              Sign Out
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-500/20 transition-all"
            >
              + New Ticket
            </button>
          </div>
        </div>

        {/* Top 3 Metrics Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#111827] border border-slate-800/80 p-5 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              TOTAL VOLUME
            </span>
            <span className="text-3xl font-bold text-white">{totalVolume}</span>
          </div>

          <div className="bg-[#111827] border border-slate-800/80 p-5 rounded-2xl">
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block mb-2">
              UNTRIAGED ISSUES
            </span>
            <span className="text-3xl font-bold text-amber-500">
              {untriagedCount}
            </span>
          </div>

          <div className="bg-[#111827] border border-slate-800/80 p-5 rounded-2xl">
            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block mb-2">
              HIGH / URGENT PRIORITY
            </span>
            <span className="text-3xl font-bold text-rose-500">
              {highPriorityCount}
            </span>
          </div>
        </div>

        {/* Ticket List Table Section */}
        <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-slate-200 mb-6">
            Active Customer Escalations
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800/80 text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-3">
                  <th className="pb-3 w-2/5">TICKET DETAILS</th>
                  <th className="pb-3">CUSTOMER</th>
                  <th className="pb-3">CATEGORY</th>
                  <th className="pb-3">PRIORITY</th>
                  <th className="pb-3">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tickets.map((t) => (
                  <tr key={t.id} className="group hover:bg-slate-900/40 transition-colors">
                    <td className="py-4 pr-4">
                      <div className="font-bold text-slate-100 mb-0.5">{t.title}</div>
                      <div className="text-slate-400 text-[11px] mb-2">{t.description}</div>
                      {t.summary && (
                        <span className="inline-block bg-indigo-950/80 border border-indigo-800/50 text-indigo-300 text-[10px] px-2 py-0.5 rounded-md">
                          {t.summary}
                        </span>
                      )}
                    </td>
                    <td className="py-4 text-slate-400 font-mono text-[11px] pr-4">
                      {t.customer || "dikshamunjal7@gmail.com"}
                    </td>
                    <td className="py-4 pr-4">
                      <span
                        className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          t.category === "BILLING"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}
                      >
                        {t.category || "BUG"}
                      </span>
                    </td>
                    <td className="py-4 pr-4 font-bold text-slate-300 text-[10px]">
                      {t.priority || "MEDIUM"}
                    </td>
                    <td className="py-4">
                      <select
                        value={t.status || "UNTRIAGED"}
                        onChange={(e) => handleStatusChange(t.id, e.target.value)}
                        className="bg-[#0B0F19] border border-slate-800 text-slate-300 text-[11px] rounded-lg p-1.5 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="UNTRIAGED">UNTRIAGED</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="RESOLVED">RESOLVED</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* New Ticket Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-white">Create New Escalation</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Issue Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Failure in Payment"
                  className="w-full bg-[#0B0F19] border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Customer Email
                </label>
                <input
                  type="email"
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  placeholder="customer@example.com"
                  className="w-full bg-[#0B0F19] border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide detailed description..."
                  rows={3}
                  className="w-full bg-[#0B0F19] border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-[#6366F1] hover:bg-[#4F46E5] disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-lg shadow-indigo-500/20"
                >
                  {loading ? "Auto-Triaging..." : "Submit Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
