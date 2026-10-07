// src/app/page.tsx

import { prisma } from "@/lib/prisma";
import { Reception } from "@/components/reception/reception";
import type { ReceptionTreatment } from "@/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const treatments = await prisma.treatment.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      tracks: { orderBy: { position: "asc" }, include: { track: true } },
    },
  });

  const data: ReceptionTreatment[] = treatments.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    durationMin: t.durationMin,
    ambience: t.ambience,
    tracks: t.tracks.map(({ track }) => ({
      id: track.id,
      title: track.title,
      artist: track.artist,
      url: track.url,
    })),
  }));

  return <Reception treatments={data} />;
}
