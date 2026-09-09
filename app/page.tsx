"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";

interface Ticket {
  id: string | number;
  title: string;
  description: string;
  customerEmail?: string;
  customer?: string;
  category: string;
  priority: string;
  status: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", customerEmail: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/tickets");
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (err) {
      console.error("Failed to fetch tickets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchTickets();
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center text-gray-400">
        Loading session...
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-[#0b0f17] flex flex-col items-center justify-center text-white p-4">
        <h1 className="text-2xl font-bold mb-4">DevRev Support Portal</h1>
        <p className="text-gray-400 mb-6">Please sign in to access the dashboard.</p>
        <a
          href="/api/auth/signin"
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          Sign In
        </a>
      </div>
    );
  }

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormData({ title: "", description: "", customerEmail: "" });
        setIsModalOpen(false);
        fetchTickets();
      } else {
        const errData = await res.json();
        alert(`Error creating ticket: ${errData.error || "Server error"}`);
      }
    } catch (err) {
      console.error("Failed to create ticket", err);
      alert("Network error creating ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string | number, newStatus: string) => {
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchTickets();
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const totalVolume = tickets.length;
  const untriagedCount = tickets.filter((t) => t.status === "UNTRIAGED").length;
  const highPriorityCount = tickets.filter((t) => t.priority === "HIGH").length;

  return (
    <div className="min-h-screen bg-[#0b0f17] text-gray-100 p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">DevRev Support & Escalation Portal</h1>
          <p className="text-sm text-gray-400 mt-1">Automated Triage & Shared Memory Sync</p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-xs text-gray-400">
            User: <strong className="text-gray-200">{session?.user?.email || "admin@devrev.ai"}</strong>
          </span>
          <button
            onClick={handleSignOut}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-gray-300 px-3 py-1.5 rounded border border-slate-700 cursor-pointer"
          >
            Sign Out
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm px-4 py-2 rounded-lg shadow-lg cursor-pointer"
          >
            + New Ticket
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#121824] border border-slate-800 p-6 rounded-xl">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">TOTAL VOLUME</span>
          <p className="text-4xl font-extrabold text-white mt-2">{totalVolume}</p>
        </div>
        <div className="bg-[#121824] border border-slate-800 p-6 rounded-xl">
          <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider">UNTRIAGED ISSUES</span>
          <p className="text-4xl font-extrabold text-amber-500 mt-2">{untriagedCount}</p>
        </div>
        <div className="bg-[#121824] border border-slate-800 p-6 rounded-xl">
          <span className="text-xs font-semibold text-rose-500 uppercase tracking-wider">HIGH / URGENT PRIORITY</span>
          <p className="text-4xl font-extrabold text-rose-500 mt-2">{highPriorityCount}</p>
        </div>
      </div>

      {/* Main Table */}
      <div className="max-w-7xl mx-auto bg-[#121824] border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">Active Customer Escalations</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading tickets...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4">TICKET DETAILS</th>
                  <th className="px-6 py-4">CUSTOMER</th>
                  <th className="px-6 py-4">CATEGORY</th>
                  <th className="px-6 py-4">PRIORITY</th>
                  <th className="px-6 py-4">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {tickets.map((ticket, index) => {
                  const uniqueKey = ticket.id ?? `ticket-${index}`;
                  return (
                    <tr key={uniqueKey} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-6 py-4 max-w-md">
                        <div className="font-semibold text-white">{ticket.title}</div>
                        <div className="text-xs text-gray-400 mt-1">{ticket.description}</div>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-400">
                        {ticket.customerEmail || ticket.customer || "dikshamunjal7@gmail.com"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                            ticket.category === "BUG"
                              ? "bg-rose-950/60 text-rose-400 border border-rose-800/40"
                              : ticket.category === "BILLING"
                              ? "bg-amber-950/60 text-amber-400 border border-amber-800/40"
                              : "bg-purple-950/60 text-purple-400 border border-purple-800/40"
                          }`}
                        >
                          {ticket.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-xs text-gray-300">{ticket.priority}</td>
                      <td className="px-6 py-4">
                        <select
                          value={ticket.status}
                          onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                          className="bg-slate-900 border border-slate-700 text-gray-200 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="UNTRIAGED">UNTRIAGED</option>
                          <option value="IN_PROGRESS">IN_PROGRESS</option>
                          <option value="RESOLVED">RESOLVED</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#121824] border border-slate-800 rounded-xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Create New Ticket</h3>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">TITLE</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg p-2.5 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">DESCRIPTION</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg p-2.5 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">CUSTOMER EMAIL</label>
                <input
                  type="email"
                  required
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg p-2.5 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-gray-300 rounded-lg text-sm hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-500 disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
