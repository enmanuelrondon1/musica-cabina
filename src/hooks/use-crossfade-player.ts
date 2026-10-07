// src/hooks/use-crossfade-player.ts

import { useCallback, useEffect, useRef, useState } from "react";

const FADE_IN_SEC = 2;

type Deck = { audio: HTMLAudioElement; gain: GainNode };

type Engine = {
  resume: () => Promise<void>;
  pause: () => void;
  fadeOut: (sec: number) => void;
};

// play() se rechaza con AbortError cuando se interrumpe a propósito (no es un fallo real)
function isAbort(e: unknown) {
  return e instanceof DOMException && e.name === "AbortError";
}

export function useCrossfadePlayer(urls: string[], crossfadeSec = 6) {
  const engineRef = useRef<Engine | null>(null);
  const [trackIndex, setTrackIndex] = useState(0);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (urls.length === 0) return;

    const ctx = new AudioContext();
    let disposed = false;
    let fadeTimer: ReturnType<typeof setTimeout> | undefined;

    const decks: Deck[] = [0, 1].map(() => {
      const audio = new Audio();
      audio.crossOrigin = "anonymous"; // necesario para usar el audio con Web Audio
      audio.preload = "auto";
      const gain = ctx.createGain();
      gain.gain.value = 0;
      ctx.createMediaElementSource(audio).connect(gain).connect(ctx.destination);
      return { audio, gain };
    });

    const state = {
      started: false,
      playing: false,
      crossfading: false,
      fadingOut: false,
      active: 0,
      index: 0,
      fade: 0,
    };

    const nextIndexOf = (i: number) => (i + 1) % urls.length;

    function rampTo(deck: Deck, value: number, sec: number) {
      const param = deck.gain.gain;
      const t = ctx.currentTime;
      param.cancelScheduledValues(t);
      param.setValueAtTime(param.value, t);
      param.linearRampToValueAtTime(value, t + sec);
    }

    // Carga la pista siguiente en el reproductor libre para que la mezcla sea inmediata
    function preloadNext() {
      const idle = decks[1 - state.active];
      idle.audio.src = urls[nextIndexOf(state.index)];
      idle.audio.load();
    }

    function startCrossfade(fade: number) {
      const from = decks[state.active];
      const to = decks[1 - state.active];

      state.crossfading = true;
      state.fade = fade;

      to.audio.currentTime = 0;
      to.audio.play().catch((e) => {
        if (!disposed && !isAbort(e)) setBlocked(true);
      });
      rampTo(from, 0, fade);
      rampTo(to, 1, fade);
    }

    function finishCrossfade() {
      const from = decks[state.active];
      from.audio.pause();

      state.active = 1 - state.active;
      state.index = nextIndexOf(state.index);
      state.crossfading = false;

      setTrackIndex(state.index);
      preloadNext();
    }

    // Revisa cada 200 ms si toca empezar la mezcla o darla por terminada
    const intervalId = setInterval(() => {
      if (!state.playing || state.fadingOut) return;

      const current = decks[state.active];

      if (state.crossfading) {
        const incoming = decks[1 - state.active];
        if (incoming.audio.currentTime >= state.fade || current.audio.ended) finishCrossfade();
        return;
      }

      const duration = current.audio.duration;
      if (!Number.isFinite(duration) || duration <= 0) return;

      const fade = Math.min(crossfadeSec, duration / 3);
      if (duration - current.audio.currentTime <= fade) startCrossfade(fade);
    }, 200);

    async function begin() {
      const first = decks[0];
      state.active = 0;
      state.index = 0;
      state.started = true;

      first.audio.src = urls[0];
      const t = ctx.currentTime;
      first.gain.gain.cancelScheduledValues(t);
      first.gain.gain.setValueAtTime(0, t);
      first.gain.gain.linearRampToValueAtTime(1, t + FADE_IN_SEC);

      await first.audio.play();
      if (!disposed) preloadNext();
    }

    engineRef.current = {
      async resume() {
        try {
          await ctx.resume();
          if (disposed) return;
          state.playing = true;

          if (!state.started) {
            await begin();
          } else {
            await decks[state.active].audio.play();
            if (state.crossfading) await decks[1 - state.active].audio.play();
          }
          if (!disposed) setBlocked(false);
        } catch (e) {
          if (disposed || isAbort(e)) return;
          setBlocked(true);
        }
      },

      // Al suspender el contexto, los fundidos en curso también quedan congelados
      pause() {
        state.playing = false;
        decks.forEach((d) => d.audio.pause());
        ctx.suspend().catch(() => {});
      },

      fadeOut(sec: number) {
        if (!state.started || state.fadingOut) return;
        state.fadingOut = true;
        decks.forEach((d) => rampTo(d, 0, sec));
        fadeTimer = setTimeout(() => {
          state.playing = false;
          decks.forEach((d) => d.audio.pause());
        }, sec * 1000 + 100);
      },
    };

    return () => {
      disposed = true;
      clearInterval(intervalId);
      if (fadeTimer) clearTimeout(fadeTimer);
      decks.forEach(({ audio }) => {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
      });
      ctx.close().catch(() => {});
      engineRef.current = null;
    };
  }, [urls, crossfadeSec]);

  const resume = useCallback(() => engineRef.current?.resume(), []);
  const pause = useCallback(() => engineRef.current?.pause(), []);
  const fadeOut = useCallback((sec: number) => engineRef.current?.fadeOut(sec), []);

  return { trackIndex, blocked, resume, pause, fadeOut };
}