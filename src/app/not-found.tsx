// src/app/not-found.tsx

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm uppercase tracking-widest text-muted">Error 404</p>
      <h1 className="font-serif text-3xl">Esta página no existe</h1>
      <Link
        href="/"
        className="rounded-full bg-sage-dark px-8 py-3 text-sm font-medium text-white transition hover:opacity-90"
      >
        Volver a recepción
      </Link>
    </main>
  );
}