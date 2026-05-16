import type { NextAuthConfig } from "next-auth";

/**
 * Auth.js v5 config — only used when AUTH_MODE=multi.
 * Providers and adapter are wired up in Milestone 6.
 */
export const authConfig: NextAuthConfig = {
  providers: [],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};
