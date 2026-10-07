// src/components/reception/reception.tsx

"use client";

import { useState } from "react";
import { AMBIENCE_LABELS, type ReceptionTreatment } from "@/types";
import { Session } from "./session";

export function Reception({ treatments }: { treatments: ReceptionTreatment[] }) {
  const [active, setActive] = useState<ReceptionTreatment | null>(null);

  return (
    <>
      <main className="mx-auto max-w-5xl space-y-10 px-6 py-14">
        <header>
          <p className="text-sm uppercase tracking-widest text-muted">Recepción</p>
          <h1 className="font-serif text-5xl">¿Qué tratamiento comienza?</h1>
        </header>

        {treatments.length === 0 && (
          <p className="text-sm text-muted">
            Aún no hay tratamientos. Créalos desde el panel del centro.
          </p>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {treatments.map((t) => {
            const playable = t.tracks.length > 0;
            return (
              <button
                key={t.id}
                type="button"
                disabled={!playable}
                onClick={() => setActive(t)}
                className="flex flex-col gap-3 rounded-[2rem] border border-border bg-card p-7 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
              >
                <span className="text-xs uppercase tracking-widest text-sage-dark">
                  {AMBIENCE_LABELS[t.ambience]}
                </span>
                <span className="font-serif text-2xl">{t.name}</span>
                {t.description && <span className="text-sm text-muted">{t.description}</span>}
                <span className="mt-auto pt-4 text-sm text-muted">
                  {t.durationMin} min{playable ? "" : " · Sin música asignada"}
                </span>
              </button>
            );
          })}
        </div>
      </main>

      {active && (
        <div className="animate-fade-in fixed inset-0 z-50 overflow-y-auto bg-background">
          <Session key={active.id} treatment={active} onClose={() => setActive(null)} />
        </div>
      )}
    </>
  );
}