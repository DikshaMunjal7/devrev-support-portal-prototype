import { NextResponse } from 'next/server';

// Temporary in-memory store for rapid prototype demo
let tickets: any[] = [
  {
    id: '1',
    title: 'Payment Gateway Error on Checkout',
    description: 'Customers are getting 500 error when clicking pay now.',
    priority: 'HIGH',
    status: 'UNTRIAGED',
    category: 'BUG',
    customerEmail: 'alex@acme.com',
    aiSummary: 'Summary: Payment Gateway Error. Automated AI Triage flagged as BUG.',
    createdAt: new Date().toISOString(),
  }
];

export async function GET() {
  return NextResponse.json(tickets);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, priority, customerEmail } = body;

    const category = description.toLowerCase().includes('bug') || description.toLowerCase().includes('error') 
      ? 'BUG' 
      : description.toLowerCase().includes('invoice') || description.toLowerCase().includes('charge')
      ? 'BILLING'
      : 'FEATURE_REQUEST';

    const newTicket = {
      id: Date.now().toString(),
      title,
      description,
      priority: priority || 'MEDIUM',
      status: 'UNTRIAGED',
      category,
      customerEmail,
      aiSummary: `Summary: ${title}. Automated AI Triage flagged as ${category}.`,
      createdAt: new Date().toISOString(),
    };

    tickets.unshift(newTicket);
    return NextResponse.json(newTicket, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
  }
}
