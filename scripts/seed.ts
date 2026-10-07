// scripts/seed.ts

import { PrismaClient, type Ambience } from "@prisma/client";

const prisma = new PrismaClient();

const treatments: {
  name: string;
  description: string;
  durationMin: number;
  ambience: Ambience;
}[] = [
  {
    name: "Masaje relajante",
    description: "Masaje corporal de presión suave para soltar tensiones.",
    durationMin: 60,
    ambience: "CALM",
  },
  {
    name: "Facial hidratante",
    description: "Limpieza e hidratación profunda con un ritmo pausado.",
    durationMin: 45,
    ambience: "NATURE",
  },
  {
    name: "Aromaterapia",
    description: "Sesión de respiración guiada con aceites esenciales.",
    durationMin: 30,
    ambience: "MEDITATIVE",
  },
  {
    name: "Exfoliación corporal",
    description: "Renueva la piel con una exfoliación suave y revitalizante.",
    durationMin: 40,
    ambience: "ENERGIZING",
  },
  {
    name: "Piedras calientes",
    description: "Masaje con piedras volcánicas para un descanso profundo.",
    durationMin: 75,
    ambience: "CALM",
  },
];

async function main() {
  const tracks = await prisma.track.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  let created = 0;
  let assigned = 0;

  for (const t of treatments) {
    let treatment = await prisma.treatment.findFirst({
      where: { name: { equals: t.name, mode: "insensitive" } },
    });

    if (!treatment) {
      treatment = await prisma.treatment.create({ data: t });
      created++;
    }

    // Solo asigna pistas a los tratamientos que todavía no tienen ninguna
    const current = await prisma.treatmentTrack.count({ where: { treatmentId: treatment.id } });

    if (current === 0 && tracks.length > 0) {
      await prisma.treatmentTrack.createMany({
        data: tracks.map((track, position) => ({
          treatmentId: treatment.id,
          trackId: track.id,
          position,
        })),
      });
      assigned++;
    }
  }

  console.log(`Tratamientos creados: ${created}. Con pistas asignadas ahora: ${assigned}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());