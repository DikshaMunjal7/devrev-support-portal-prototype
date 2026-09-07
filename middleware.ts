import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/api/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET || "devrev-secret-key-2026-super-secret",
});

export const config = {
  // Only protect the root dashboard, exclude /api/auth, static files, and favicons
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
