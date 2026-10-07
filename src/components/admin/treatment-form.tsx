// src/components/admin/treatment-form.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTreatment } from "@/app/admin/actions";
import { AMBIENCE_LABELS, type Ambience } from "@/types";

const inputClass =
  "w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-sage-dark";

export function TreatmentForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget; // se captura antes de los await
    const data = new FormData(form);

    setError(null);
    setLoading(true);

    try {
      const result = await createTreatment({
        name: String(data.get("name") ?? ""),
        description: String(data.get("description") ?? "") || undefined,
        durationMin: Number(data.get("durationMin")),
        ambience: data.get("ambience") as Ambience,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      form.reset();
      router.refresh();
    } catch {
      setError("Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-sm"
    >
      <h2 className="font-serif text-2xl">Nuevo tratamiento</h2>

      <input name="name" placeholder="Nombre (ej. Masaje relajante)" required className={inputClass} />
      <input name="description" placeholder="Descripción (opcional)" className={inputClass} />

      <div className="grid gap-4 sm:grid-cols-2">
        <input
          name="durationMin"
          type="number"
          min={1}
          max={240}
          placeholder="Duración (minutos)"
          required
          className={inputClass}
        />
        <select name="ambience" defaultValue="CALM" className={inputClass}>
          {(Object.entries(AMBIENCE_LABELS) as [Ambience, string][]).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-terracotta">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-sage-dark px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Creando…" : "Crear tratamiento"}
      </button>
    </form>
  );
}