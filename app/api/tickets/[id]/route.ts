import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.status) {
      const stmt = db.prepare('UPDATE tickets SET status = ? WHERE id = ?');
      stmt.run(body.status, id);
    }

    const updatedTicket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(id);
    return NextResponse.json(updatedTicket);
  } catch (error) {
    console.error('PATCH Error:', error);
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
  }
}
