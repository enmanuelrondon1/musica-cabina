// src/auth.config.ts

import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    // Lo usa el proxy: devolver false redirige a /login
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user);

      if (nextUrl.pathname.startsWith("/admin")) return isLoggedIn;

      if (nextUrl.pathname === "/login" && isLoggedIn) {
        return Response.redirect(new URL("/admin", nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;