import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "DevRev Support Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username = credentials?.username?.trim();
        const password = credentials?.password?.trim();

        // Validate hardcoded administrative credentials
        if (username === "admin" && password === "devrev2026") {
          return {
            id: "1",
            name: "Support Engineer",
            email: "admin@devrev.ai",
          };
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "devrev-secret-key-2026-super-secret",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
