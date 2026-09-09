import Database from 'better-sqlite3';
import path from 'path';

// Use /tmp for Vercel serverless environment compatibility
const dbDir = process.env.NODE_ENV === 'production' ? '/tmp' : process.cwd();
const dbPath = path.join(dbDir, 'tickets.db');

const db = new Database(dbPath);

// 1. Create table with ALL required fields including customer
db.exec(`
  CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    customerEmail TEXT NOT NULL,
    customer TEXT,
    priority TEXT NOT NULL,
    status TEXT NOT NULL,
    category TEXT NOT NULL,
    aiSummary TEXT NOT NULL,
    createdAt TEXT NOT NULL
  )
`);

// 2. Fallback check: if /tmp/tickets.db already existed without customer, add it now
try {
  db.exec("ALTER TABLE tickets ADD COLUMN customer TEXT;");
} catch (e) {
  // Column already exists, safe to ignore
}

// 3. Auto-seed default records if table is empty
const count = (db.prepare('SELECT COUNT(*) as count FROM tickets').get() as { count: number }).count;

if (count === 0) {
  const seed = db.prepare(`
    INSERT INTO tickets (id, title, description, customerEmail, customer, priority, status, category, aiSummary, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  seed.run(
    'ticket_1',
    'Cannot process credit card payment',
    'Customer receives 500 error when submitting credit card checkout on payment page.',
    'alex@acme.com',
    'Acme Corp',
    'HIGH',
    'UNTRIAGED',
    'BUG',
    'High-severity payment gateway error on checkout page.',
    new Date().toISOString()
  );

  seed.run(
    'ticket_2',
    'Annual subscription discount inquiry',
    'User asking if there is a 20% discount for enterprise annual billing.',
    'finance@corp.com',
    'Corp Inc',
    'LOW',
    'IN_PROGRESS',
    'BILLING',
    'Sales inquiry regarding enterprise tier pricing.',
    new Date().toISOString()
  );
}

export default db;
