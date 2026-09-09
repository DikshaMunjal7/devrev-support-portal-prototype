import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username / Email", type: "text", placeholder: "admin" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (credentials?.username) {
          return {
            id: "1",
            name: credentials.username,
            email: credentials.username.includes("@") 
              ? credentials.username 
              : `${credentials.username}@devrev.ai`,
          };
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "devrev-super-secret-key-123456",
});

export { handler as GET, handler as POST };
