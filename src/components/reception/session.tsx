// src/components/reception/session.tsx

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCrossfadePlayer } from "@/hooks/use-crossfade-player";
import { formatClock } from "@/lib/format";
import { AMBIENCE_LABELS, type ReceptionTreatment } from "@/types";

const RADIUS = 120;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CROSSFADE_SEC = 6;
const FADE_OUT_SEC = 4;

type Props = {
  treatment: ReceptionTreatment;
  onClose: () => void;
};

export function Session({ treatment, onClose }: Props) {
  const { tracks } = treatment;
  const totalMs = treatment.durationMin * 60 * 1000;

  const urls = useMemo(() => tracks.map((t) => t.url), [tracks]);
  const { trackIndex, blocked, resume, pause, fadeOut } = useCrossfadePlayer(
    urls,
    CROSSFADE_SEC
  );

  const [remainingMs, setRemainingMs] = useState(totalMs);
  const [running, setRunning] = useState(true);
  const [finished, setFinished] = useState(false);

  const remainingRef = useRef(totalMs);

  // Música: sigue al botón Pausar/Reanudar (al terminar, el apagado lo hace el fundido de salida)
  useEffect(() => {
    if (finished) return;
    if (running) resume();
    else pause();
  }, [running, finished, resume, pause]);

  useEffect(() => {
    if (finished) fadeOut(FADE_OUT_SEC);
  }, [finished, fadeOut]);

  // Temporizador basado en la hora real (no se desfasa aunque la pestaña vaya lenta)
  useEffect(() => {
    if (!running) return;

    const endAt = Date.now() + remainingRef.current;
    const id = setInterval(() => {
      const left = Math.max(0, endAt - Date.now());
      remainingRef.current = left;
      setRemainingMs(left);

      if (left === 0) {
        clearInterval(id);
        setRunning(false);
        setFinished(true);
      }
    }, 250);

    return () => clearInterval(id);
  }, [running]);

  const progress = remainingMs / totalMs;

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-8 px-6 py-10 text-center">
      <div>
        <p className="text-sm uppercase tracking-widest text-muted">
          {AMBIENCE_LABELS[treatment.ambience]}
        </p>
        <h2 className="font-serif text-4xl">{treatment.name}</h2>
      </div>

      <div className="relative flex h-72 w-72 items-center justify-center">
        <div
          className="animate-breathe absolute inset-6 rounded-full bg-sage/25"
          style={{ animationPlayState: running ? "running" : "paused" }}
        />
        <svg viewBox="0 0 280 280" className="absolute inset-0 h-full w-full -rotate-90">
          <circle
            cx="140"
            cy="140"
            r={RADIUS}
            fill="none"
            strokeWidth="8"
            className="stroke-border"
          />
          <circle
            cx="140"
            cy="140"
            r={RADIUS}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
            className={running ? "stroke-terracotta" : "stroke-sage"}
          />
        </svg>
        <span className="relative font-serif text-6xl tabular-nums">
          {formatClock(remainingMs)}
        </span>
      </div>

      <div className="min-h-12 space-y-1">
        {finished ? (
          <p className="font-serif text-2xl">Sesión completada</p>
        ) : (
          <>
            <p className="text-sm text-muted">
              {running ? "Sonando" : "En pausa"}: {tracks[trackIndex].title}
            </p>
            {blocked && (
              <p className="text-sm text-terracotta">
                No se pudo reproducir el audio. Pulsa Pausar y luego Reanudar para reintentarlo.
              </p>
            )}
          </>
        )}
      </div>

      <div className="flex gap-3">
        {!finished && (
          <button
            type="button"
            onClick={() => setRunning((v) => !v)}
            className="rounded-full bg-sage-dark px-8 py-3 text-sm font-medium text-white transition hover:opacity-90"
          >
            {running ? "Pausar" : "Reanudar"}
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-border bg-card px-8 py-3 text-sm font-medium transition hover:bg-background"
        >
          {finished ? "Volver a recepción" : "Terminar sesión"}
        </button>
      </div>
    </div>
  );
}