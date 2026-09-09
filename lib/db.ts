import Database from 'better-sqlite3';
import path from 'path';

const dbDir = process.env.NODE_ENV === 'production' ? '/tmp' : process.cwd();
const dbPath = path.join(dbDir, 'tickets_v3.db');

const db = new Database(dbPath);

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

export default db;
