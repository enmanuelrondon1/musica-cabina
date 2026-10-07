// src/app/login/actions.ts

"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export async function authenticate(
  _prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  try {
    await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirectTo: "/admin",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return error.type === "CredentialsSignin"
        ? "Correo o contraseña incorrectos"
        : "No se pudo iniciar sesión. Inténtalo de nuevo.";
    }
    // Hay que relanzarlo: el redirect de Next.js también se lanza como excepción
    throw error;
  }
}