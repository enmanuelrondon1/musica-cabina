//src/types/index.ts

import type { Ambience, Prisma } from "@prisma/client";

export type { Ambience, Treatment, Track } from "@prisma/client";

export type TreatmentWithTracks = Prisma.TreatmentGetPayload<{
  include: { tracks: { include: { track: true }; orderBy: { position: "asc" } } };
}>;

export const AMBIENCE_LABELS: Record<Ambience, string> = {
  CALM: "Calma",
  NATURE: "Naturaleza",
  ENERGIZING: "Energizante",
  MEDITATIVE: "Meditativo",
};

export type ReceptionTreatment = {
  id: string;
  name: string;
  description: string | null;
  durationMin: number;
  ambience: Ambience;
  tracks: { id: string; title: string; artist: string | null; url: string }[];
};