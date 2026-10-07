// src/app/error.tsx

"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-serif text-3xl">Algo no salió como esperábamos</h1>
      <p className="text-sm text-muted">
        No pudimos cargar esta pantalla. Puede ser un problema temporal de conexión.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-full bg-sage-dark px-8 py-3 text-sm font-medium text-white transition hover:opacity-90"
      >
        Reintentar
      </button>
    </main>
  );
}