import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "DevRev Support Login",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "admin" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (credentials?.username === "admin" && credentials?.password === "devrev2026") {
          return { id: "1", name: "Support Engineer", email: "admin@devrev.ai" };
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: '/api/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET || "devrev-secret-key-2026",
});

export { handler as GET, handler as POST };
