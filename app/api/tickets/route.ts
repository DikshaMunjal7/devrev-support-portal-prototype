import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { triageTicket } from '@/lib/ai-service';

export async function GET() {
  try {
    const tickets = db.prepare('SELECT * FROM tickets ORDER BY createdAt DESC').all();
    return NextResponse.json(tickets);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const title = body.title || 'Untitled Ticket';
    const description = body.description || '';
    const customerEmail = body.customerEmail || 'unknown@domain.com';

    // 1. CALL GEMINI AI
    const aiResult = await triageTicket(title, description);

    // 2. BUILD TICKET WITH GEMINI RESPONSE
    const newTicket = {
      id: `ticket_${Date.now()}`,
      title,
      description,
      customerEmail,
      priority: aiResult.priority || body.priority || 'MEDIUM',
      status: 'UNTRIAGED',
      category: aiResult.category || 'GENERAL',
      aiSummary: aiResult.summary, // Live Gemini summary stored in DB
      createdAt: new Date().toISOString(),
    };

    // 3. INSERT INTO SQLITE
    const stmt = db.prepare(`
      INSERT INTO tickets (id, title, description, customerEmail, priority, status, category, aiSummary, createdAt)
      VALUES (@id, @title, @description, @customerEmail, @priority, @status, @category, @aiSummary, @createdAt)
    `);

    stmt.run(newTicket);

    return NextResponse.json(newTicket, { status: 201 });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
  }
}
