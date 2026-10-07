// src/app/admin/tratamientos/page.tsx

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PAGE_SIZE, parsePage, totalPagesOf } from "@/lib/pagination";
import { Pagination } from "@/components/pagination";
import { TreatmentForm } from "@/components/admin/treatment-form";
import { TreatmentCard } from "@/components/admin/treatment-card";

export const dynamic = "force-dynamic";

const BASE_PATH = "/admin/tratamientos";

export default async function TreatmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { page: pageParam } = await searchParams;
  const page = parsePage(pageParam);

  const total = await prisma.treatment.count();
  const totalPages = totalPagesOf(total);

  // Si se borró el último elemento de una página, vuelve a la última que exista
  if (page > totalPages) {
    redirect(totalPages === 1 ? BASE_PATH : `${BASE_PATH}?page=${totalPages}`);
  }

  const [treatments, tracks] = await Promise.all([
    prisma.treatment.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { tracks: { orderBy: { position: "asc" } } },
    }),
    // Todas las pistas (solo lo necesario): cada tratamiento puede asignar cualquiera
    prisma.track.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, artist: true, durationSec: true },
    }),
  ]);

  return (
    <main className="space-y-10 py-10">
      <header>
        <p className="text-sm uppercase tracking-widest text-muted">Panel del centro</p>
        <h1 className="font-serif text-4xl">Tratamientos</h1>
      </header>

      <section className="space-y-4">
        <TreatmentForm />

        <h2 className="pt-4 font-serif text-2xl">Tratamientos ({total})</h2>

        {total === 0 && (
          <p className="text-sm text-muted">Aún no hay tratamientos. Crea el primero.</p>
        )}

        {treatments.map((t) => (
          <TreatmentCard
            key={t.id}
            treatment={{
              id: t.id,
              name: t.name,
              description: t.description,
              durationMin: t.durationMin,
              ambience: t.ambience,
              trackIds: t.tracks.map((tt) => tt.trackId),
            }}
            tracks={tracks}
          />
        ))}

        <Pagination page={page} totalPages={totalPages} basePath={BASE_PATH} />
      </section>
    </main>
  );
}