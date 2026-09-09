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
    const email = customerEmail || "dikshamunjal7@gmail.com";
    const customer = email.split("@")[0] || "Customer";
    const createdAt = new Date().toISOString();

    let category = "FEATURE";
    let priority = "MEDIUM";
    let aiSummary = `${category} ticket submitted regarding ${title}`;

    try {
      const aiPromise = ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Analyze this support ticket and return STRICT JSON ONLY (no markdown formatting, no code blocks):
{"category": "BUG" | "BILLING" | "FEATURE", "priority": "LOW" | "MEDIUM" | "HIGH" | "URGENT"}

Title: ${title}
Description: ${description}`,
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("AI Timeout")), 2500)
      );

      const response: any = await Promise.race([aiPromise, timeoutPromise]);
      const text = response.text();

      if (text) {
        // Extract raw JSON string safely
        const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.category) category = parsed.category.toUpperCase();
          if (parsed.priority) priority = parsed.priority.toUpperCase();
        }
      }
    } catch (err) {
      // Robust Fallback categorization logic
      const lower = `${title} ${description}`.toLowerCase();

      const isBilling =
        lower.includes("bill") ||
        lower.includes("charge") ||
        lower.includes("pay") ||
        lower.includes("invoice") ||
        lower.includes("renew") ||
        lower.includes("discount") ||
        lower.includes("cost") ||
        lower.includes("price") ||
        lower.includes("$");

      const isBug =
        lower.includes("bug") ||
        lower.includes("error") ||
        lower.includes("fail") ||
        lower.includes("crash") ||
        lower.includes("glitch") ||
        lower.includes("broken") ||
        lower.includes("issue");

      if (isBilling) {
        category = "BILLING";
        priority = "HIGH";
      } else if (isBug) {
        category = "BUG";
        priority = "HIGH";
      } else {
        category = "FEATURE";
        priority = "LOW";
      }
    }

    try {
      db.exec("ALTER TABLE tickets ADD COLUMN customer TEXT;");
    } catch (e) {}

    try {
      db.exec("ALTER TABLE tickets ADD COLUMN aiSummary TEXT;");
    } catch (e) {}

    const stmt = db.prepare(`
      INSERT INTO tickets (id, title, description, customerEmail, customer, category, priority, status, aiSummary, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, title, description, email, customer, category, priority, status, aiSummary, createdAt);

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
