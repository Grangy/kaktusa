import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const isDev = process.env.NODE_ENV === "development";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret:
    process.env.AUTH_SECRET ||
    (isDev ? "kaktusa-dev-secret-do-not-use-in-production" : undefined),
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        password: { label: "Пароль", type: "password" },
      },
      async authorize(credentials) {
        const password = process.env.ADMIN_PASSWORD;
        if (!password) return null;
        if (credentials?.password === password) {
          return { id: "admin", name: "Admin", email: "admin@kaktusa.ru" };
        }
        return null;
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/admin/login" },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
});
