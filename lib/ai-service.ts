import { GoogleGenAI, Type } from "@google/genai";

export async function triageTicket(title: string, description: string) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze this support ticket and determine its category and priority:\nTitle: ${title}\nDescription: ${description}`,
      config: {
        systemInstruction:
          "You are an automated support ticket classifier. You must return structured JSON matching this ruleset:\n" +
          "1. category MUST be exactly one of: 'BUG', 'BILLING', 'FEATURE_REQUEST'\n" +
          "2. priority MUST be exactly one of: 'HIGH', 'MEDIUM', 'LOW'\n" +
          "3. summary MUST be a 1-sentence executive summary.\n\n" +
          "Rules:\n" +
          "- If the request asks for new capabilities, export options, or enhancements -> category = 'FEATURE_REQUEST', priority = 'LOW' or 'MEDIUM'.\n" +
          "- If the request involves money, charges, subscriptions, invoices, or discounts -> category = 'BILLING'.\n" +
          "- If something is broken or throwing errors -> category = 'BUG'.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            priority: { type: Type.STRING },
            category: { type: Type.STRING },
          },
          required: ["summary", "priority", "category"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");

    return {
      summary: parsed.summary || title,
      priority: ["HIGH", "MEDIUM", "LOW"].includes(parsed.priority) ? parsed.priority : "MEDIUM",
      category: ["BUG", "BILLING", "FEATURE_REQUEST"].includes(parsed.category) ? parsed.category : "FEATURE_REQUEST",
    };
  } catch (error) {
    console.error("Gemini AI API Failed:", error);
    
    // Keyword fallback if API key fails or errors out
    const text = `${title} ${description}`.toLowerCase();
    let category = "BUG";
    let priority = "MEDIUM";

    if (text.includes("export") || text.includes("feature") || text.includes("add") || text.includes("option")) {
      category = "FEATURE_REQUEST";
      priority = "LOW";
    } else if (text.includes("charge") || text.includes("bill") || text.includes("discount") || text.includes("invoice")) {
      category = "BILLING";
      priority = "HIGH";
    }

    return {
      summary: `Auto-triaged: ${title}`,
      priority,
      category,
    };
  }
}
