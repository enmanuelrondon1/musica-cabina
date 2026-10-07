// src/components/login-form.tsx

"use client";

import { useActionState } from "react";
import { authenticate } from "@/app/login/actions";

const inputClass =
  "w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-sage-dark";

export function LoginForm() {
  const [error, formAction, pending] = useActionState(authenticate, undefined);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-sm"
    >
      <input
        name="email"
        type="email"
        placeholder="Correo"
        autoComplete="username"
        required
        className={inputClass}
      />
      <input
        name="password"
        type="password"
        placeholder="Contraseña"
        autoComplete="current-password"
        required
        className={inputClass}
      />

      {error && <p className="text-sm text-terracotta">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-sage-dark px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}