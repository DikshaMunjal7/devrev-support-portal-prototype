export async function triageTicket(title: string, description: string) {
  const text = `${title} ${description}`.toLowerCase();
  let category = "BUG";
  let priority = "MEDIUM";

  if (text.includes("export") || text.includes("feature") || text.includes("add") || text.includes("option") || text.includes("dark mode")) {
    category = "FEATURE_REQUEST";
    priority = "LOW";
  } else if (text.includes("charge") || text.includes("bill") || text.includes("discount") || text.includes("invoice") || text.includes("renewal")) {
    category = "BILLING";
    priority = "HIGH";
  } else if (text.includes("crash") || text.includes("error") || text.includes("500") || text.includes("broken") || text.includes("outage")) {
    category = "BUG";
    priority = "HIGH";
  }

  return {
    category,
    priority,
  };
}
