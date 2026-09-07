import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const tickets = db.prepare('SELECT * FROM tickets ORDER BY createdAt DESC').all();
    return NextResponse.json(tickets);
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    let category = 'BUG';
    if (body.description?.toLowerCase().includes('discount') || body.description?.toLowerCase().includes('invoice')) {
      category = 'BILLING';
    } else if (body.description?.toLowerCase().includes('feature') || body.description?.toLowerCase().includes('request')) {
      category = 'FEATURE_REQUEST';
    }

    const newTicket = {
      id: `ticket_${Date.now()}`,
      title: body.title || 'Untitled Ticket',
      description: body.description || '',
      customerEmail: body.customerEmail || 'unknown@domain.com',
      priority: body.priority || 'MEDIUM',
      status: 'UNTRIAGED',
      category: category,
      aiSummary: `Auto-triaged as ${category} based on description.`,
      createdAt: new Date().toISOString(),
    };

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
