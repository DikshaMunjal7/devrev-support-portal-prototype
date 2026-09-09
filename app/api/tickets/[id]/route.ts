import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || id === "null" || id === "undefined") {
      return NextResponse.json({ error: "Invalid ticket ID" }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    // Update status in database
    db.prepare("UPDATE tickets SET status = ? WHERE id = ?").run(status, id);

    // Fetch updated ticket
    const updatedTicket = db.prepare("SELECT * FROM tickets WHERE id = ?").get(id);

    if (!updatedTicket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Convert BigInt / SQLite values to standard JSON-safe values
    const safeTicket = JSON.parse(
      JSON.stringify(updatedTicket, (_, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    return NextResponse.json(safeTicket);
  } catch (error) {
    console.error("PATCH Error:", error);
    return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 });
  }
}
