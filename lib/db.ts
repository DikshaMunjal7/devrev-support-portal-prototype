import Database from 'better-sqlite3';
import path from 'path';

const dbDir = process.env.NODE_ENV === 'production' ? '/tmp' : process.cwd();
const dbPath = path.join(dbDir, 'tickets.db');

const db = new Database(dbPath);

// Create table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    customerEmail TEXT NOT NULL,
    priority TEXT NOT NULL,
    status TEXT NOT NULL,
    category TEXT NOT NULL,
    aiSummary TEXT NOT NULL,
    createdAt TEXT NOT NULL
  )
`);

// Auto-seed default records if empty
const count = (db.prepare('SELECT COUNT(*) as count FROM tickets').get() as { count: number }).count;

if (count === 0) {
  const seed = db.prepare(`
    INSERT INTO tickets (id, title, description, customerEmail, priority, status, category, aiSummary, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  seed.run(
    'ticket_1',
    'Cannot process credit card payment',
    'Customer receives 500 error when submitting credit card checkout on payment page.',
    'alex@acme.com',
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
    'LOW',
    'IN_PROGRESS',
    'BILLING',
    'Sales inquiry regarding enterprise tier pricing.',
    new Date().toISOString()
  );
}

export default db;
