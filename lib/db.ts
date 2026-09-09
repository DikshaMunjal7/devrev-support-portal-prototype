import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dbPath = path.join("/tmp", "tickets_v3.db");

const db = new Database(dbPath);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    customerEmail TEXT,
    customer TEXT,
    category TEXT DEFAULT 'FEATURE',
    priority TEXT DEFAULT 'MEDIUM',
    status TEXT DEFAULT 'UNTRIAGED',
    aiSummary TEXT,
    createdAt TEXT
  )
`);

// Seed default records if table is empty
const count = db.prepare("SELECT COUNT(*) as count FROM tickets").get() as { count: number };

if (count.count === 0) {
  const seedStmt = db.prepare(`
    INSERT INTO tickets (id, title, description, customerEmail, customer, category, priority, status, aiSummary, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const initialTickets = [
    {
      id: "ticket_seed_1",
      title: "Incorrect Charge on Annual Subscription Renewal",
      description: "Our account was billed $1,200 for enterprise tier renewal, but our contract reflects a 20% promotional discount.",
      customerEmail: "billing@corp.com",
      customer: "billing",
      category: "BILLING",
      priority: "HIGH",
      status: "UNTRIAGED",
      aiSummary: "Billing mismatch reported regarding 20% promotional discount on annual renewal.",
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: "ticket_seed_2",
      title: "Payment gateway returning 500 error on checkout",
      description: "Users are getting unhandled exceptions during credit card processing on production checkout.",
      customerEmail: "devops@techcorp.com",
      customer: "devops",
      category: "BUG",
      priority: "URGENT",
      status: "IN_PROGRESS",
      aiSummary: "Critical payment checkout gateway failure causing 500 internal server errors.",
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: "ticket_seed_3",
      title: "Request for Dark Mode in Admin Dashboard",
      description: "Our team spends hours on the portal daily and would appreciate a native dark mode toggle.",
      customerEmail: "alex@designstudio.io",
      customer: "alex",
      category: "FEATURE",
      priority: "LOW",
      status: "RESOLVED",
      aiSummary: "Feature request submitted for administrative dashboard dark theme option.",
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
  ];

  for (const t of initialTickets) {
    seedStmt.run(t.id, t.title, t.description, t.customerEmail, t.customer, t.category, t.priority, t.status, t.aiSummary, t.createdAt);
  }
}

export default db;
