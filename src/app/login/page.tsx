// src/app/login/page.tsx

import Link from "next/link";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-8 px-6 py-12">
      <header className="text-center">
        <p className="text-sm uppercase tracking-widest text-muted">Panel del centro</p>
        <h1 className="font-serif text-4xl">Iniciar sesión</h1>
      </header>

      <LoginForm />

      <Link href="/" className="text-center text-sm text-muted hover:underline">
        ← Volver a recepción
      </Link>
    </main>
  );
}