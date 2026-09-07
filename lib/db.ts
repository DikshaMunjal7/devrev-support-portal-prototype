import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'tickets.db');
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

export default db;
