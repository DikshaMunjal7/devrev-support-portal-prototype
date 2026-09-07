import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    return NextResponse.json({ success: true, id, updated: body });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
  }
}

