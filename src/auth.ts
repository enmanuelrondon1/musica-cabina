// src/auth.ts

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authConfig } from "./auth.config";

const credentialsSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminHash = process.env.ADMIN_PASSWORD_HASH;
        if (!adminEmail || !adminHash) return null;

        const { email, password } = parsed.data;
        const emailOk = email.trim().toLowerCase() === adminEmail.trim().toLowerCase();

        // Se compara siempre la contraseña para que el tiempo de respuesta no revele si el correo existe
        const passwordOk = await bcrypt.compare(password, adminHash);

        if (!emailOk || !passwordOk) return null;
        return { id: "admin", name: "Administrador", email: adminEmail };
      },
    }),
  ],
});