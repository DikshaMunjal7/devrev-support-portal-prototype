import { NextResponse } from "next/server";
import db from "@/lib/db";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function GET() {
  try {
    const tickets = db.prepare("SELECT * FROM tickets ORDER BY id DESC").all();
    const safeTickets = JSON.parse(
      JSON.stringify(tickets, (_, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );
    return NextResponse.json(safeTickets);
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, customerEmail } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    const id = `ticket_${Date.now()}`;
    const status = "UNTRIAGED";
    const customer = customerEmail || "dikshamunjal7@gmail.com";

    let category = "FEATURE";
    let priority = "MEDIUM";

    try {
      const aiPromise = ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Analyze this support ticket and return strict JSON with keys "category" (must be one of: BUG, BILLING, FEATURE) and "priority" (must be one of: LOW, MEDIUM, HIGH, URGENT).
Title: ${title}
Description: ${description}`,
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("AI Timeout")), 2500)
      );

      const response: any = await Promise.race([aiPromise, timeoutPromise]);
      const text = response.text();
      
      if (text) {
        const parsed = JSON.parse(text.replace(/```json/g, "").replace(/```/g, "").trim());
        if (parsed.category) category = parsed.category;
        if (parsed.priority) priority = parsed.priority;
      }
    } catch (err) {
      const lower = `${title} ${description}`.toLowerCase();
      if (
        lower.includes("bug") || 
        lower.includes("error") || 
        lower.includes("fail") || 
        lower.includes("crash") || 
        lower.includes("glitch") || 
        lower.includes("script") || 
        lower.includes("issue") ||
        lower.includes("password") ||
        lower.includes("reset") ||
        lower.includes("expire") ||
        lower.includes("login")
      ) {
        category = "BUG";
        priority = "HIGH";
      } else if (lower.includes("bill") || lower.includes("pay") || lower.includes("invoice") || lower.includes("charge")) {
        category = "BILLING";
        priority = "HIGH";
      } else {
        category = "FEATURE";
        priority = "LOW";
      }
    }

    const stmt = db.prepare(`
      INSERT INTO tickets (id, title, description, customerEmail, customer, category, priority, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, title, description, customer, customer, category, priority, status);

    const newTicket = db.prepare("SELECT * FROM tickets WHERE id = ?").get(id);
    const safeTicket = JSON.parse(
      JSON.stringify(newTicket, (_, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    return NextResponse.json(safeTicket, { status: 201 });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
  }
}
