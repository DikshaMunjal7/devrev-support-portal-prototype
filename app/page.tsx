'use client';

import { useState, useEffect } from 'react';

interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'UNTRIAGED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  category: 'BUG' | 'BILLING' | 'FEATURE_REQUEST';
  customerEmail: string;
  aiSummary: string;
  createdAt: string;
}

export default function SupportPortal() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [priority, setPriority] = useState('MEDIUM');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/tickets');
      const data = await res.json();
      setTickets(data);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, customerEmail, priority }),
      });
      if (res.ok) {
        setTitle('');
        setDescription('');
        setCustomerEmail('');
        setPriority('MEDIUM');
        setIsModalOpen(false);
        fetchTickets();
      }
    } catch (err) {
      console.error('Failed to create ticket:', err);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setTickets(tickets.map(t => t.id === id ? { ...t, status: newStatus as any } : t));
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const untriagedCount = tickets.filter(t => t.status === 'UNTRIAGED').length;
  const highPriorityCount = tickets.filter(t => t.priority === 'HIGH' || t.priority === 'URGENT').length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">DevRev Support & Escalation Portal</h1>
            <p className="text-slate-400 text-sm mt-1">Automated AI Triage & Shared Memory Issue Sync</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
          >
            + New Ticket
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
            <p className="text-xs font-semibold uppercase text-slate-400">Total Volume</p>
            <p className="text-3xl font-extrabold mt-2 text-white">{tickets.length}</p>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
            <p className="text-xs font-semibold uppercase text-amber-400">Untriaged Issues</p>
            <p className="text-3xl font-extrabold mt-2 text-amber-300">{untriagedCount}</p>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
            <p className="text-xs font-semibold uppercase text-rose-400">High / Urgent Priority</p>
            <p className="text-3xl font-extrabold mt-2 text-rose-300">{highPriorityCount}</p>
          </div>
        </div>

        {/* Ticket Table */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-slate-700/50">
            <h2 className="text-lg font-semibold text-white">Active Customer Escalations</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No tickets found. Create one to test AI triage!</div>
          ) : (
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/50 uppercase text-xs text-slate-400 border-b border-slate-700/50">
                <tr>
                  <th className="px-6 py-3">Ticket Details</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Priority</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 max-w-md">
                      <div className="font-semibold text-white">{ticket.title}</div>
                      <div className="text-xs text-slate-400 mt-1 line-clamp-1">{ticket.description}</div>
                      <div className="mt-2 inline-block bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 text-[11px] px-2 py-0.5 rounded font-mono">
                        {ticket.aiSummary}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-mono text-xs">{ticket.customerEmail}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        ticket.category === 'BUG' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        ticket.category === 'BILLING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {ticket.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-xs text-slate-300">{ticket.priority}</td>
                    <td className="px-6 py-4">
                      <select
                        value={ticket.status}
                        onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded text-xs px-2.5 py-1 text-slate-200 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="UNTRIAGED">UNTRIAGED</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="RESOLVED">RESOLVED</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Create Customer Ticket</h3>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Customer Email</label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="user@acme.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Cannot process credit card payment"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description (Triggers AI Triage)</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide details. Words like 'error' trigger BUG category."
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="URGENT">URGENT</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded"
                >
                  Submit & Triage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}










