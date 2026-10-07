// src/components/admin/treatment-card.tsx

"use client";

import { useState, useTransition } from "react";
import { deleteTreatment, setTreatmentTracks } from "@/app/admin/actions";
import { formatDuration } from "@/lib/format";
import { AMBIENCE_LABELS, type Ambience } from "@/types";

type TrackOption = {
  id: string;
  title: string;
  artist: string | null;
  durationSec: number;
};

type Props = {
  treatment: {
    id: string;
    name: string;
    description: string | null;
    durationMin: number;
    ambience: Ambience;
    trackIds: string[];
  };
  tracks: TrackOption[];
};

export function TreatmentCard({ treatment, tracks }: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(treatment.trackIds);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const dirty = JSON.stringify(selected) !== JSON.stringify(treatment.trackIds);
  const totalSec = selected.reduce(
    (sum, id) => sum + (tracks.find((t) => t.id === id)?.durationSec ?? 0),
    0
  );

  function toggle(id: string) {
    setMessage(null);
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function handleSave() {
    startTransition(async () => {
      const result = await setTreatmentTracks(treatment.id, selected);
      setMessage(result.ok ? "Guardado" : result.error);
    });
  }

  function handleDelete() {
    if (!confirm(`¿Eliminar "${treatment.name}"?`)) return;
    startTransition(async () => {
      await deleteTreatment(treatment.id);
    });
  }

  return (
    <article className="space-y-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl">{treatment.name}</h3>
          <p className="text-sm text-muted">
            {treatment.durationMin} min · {AMBIENCE_LABELS[treatment.ambience]} ·{" "}
            {selected.length} {selected.length === 1 ? "pista" : "pistas"}
          </p>
          {treatment.description && (
            <p className="mt-1 text-sm text-muted">{treatment.description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          className="text-sm text-terracotta transition hover:underline disabled:opacity-50"
        >
          Eliminar
        </button>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-sm font-medium text-sage-dark hover:underline"
      >
        {open ? "Ocultar pistas" : "Asignar pistas"}
      </button>

      {open && (
        <div className="space-y-3">
          {tracks.length === 0 && (
            <p className="text-sm text-muted">Sube primero alguna pista a la biblioteca.</p>
          )}

          {tracks.map((t) => {
            const index = selected.indexOf(t.id);
            return (
              <label
                key={t.id}
                className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 text-sm"
              >
                <input
                  type="checkbox"
                  checked={index !== -1}
                  onChange={() => toggle(t.id)}
                  className="accent-sage-dark"
                />
                <span className="flex-1">
                  {t.title}
                  <span className="text-muted">
                    {t.artist ? ` · ${t.artist}` : ""} · {formatDuration(t.durationSec)}
                  </span>
                </span>
                {index !== -1 && (
                  <span className="rounded-full bg-sage px-2 py-0.5 text-xs text-white">
                    {index + 1}
                  </span>
                )}
              </label>
            );
          })}

          {selected.length > 0 && (
            <p className="text-sm text-muted">
              Las pistas suman {formatDuration(totalSec)}; el tratamiento dura{" "}
              {treatment.durationMin} min.
              {totalSec < treatment.durationMin * 60 && " La música se repetirá en loop."}
            </p>
          )}

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={pending || !dirty}
              className="rounded-full bg-sage-dark px-5 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {pending ? "Guardando…" : "Guardar pistas"}
            </button>
            {message && <span className="text-sm text-muted">{message}</span>}
          </div>
        </div>
      )}
    </article>
  );
}