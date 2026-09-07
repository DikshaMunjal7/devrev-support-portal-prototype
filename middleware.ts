export { default } from "next-auth/middleware";

// Protect the home dashboard and API endpoints
export const config = {
  matcher: ["/", "/api/tickets/:path*"],
};
