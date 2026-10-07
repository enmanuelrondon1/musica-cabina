// src/app/admin/musica/page.tsx

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatDuration } from "@/lib/format";
import { PAGE_SIZE, parsePage, totalPagesOf } from "@/lib/pagination";
import { Pagination } from "@/components/pagination";
import { TrackUploader } from "@/components/admin/track-uploader";
import { DeleteTrackButton } from "@/components/admin/delete-track-button";

export const dynamic = "force-dynamic";

const BASE_PATH = "/admin/musica";

export default async function MusicPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { page: pageParam } = await searchParams;
  const page = parsePage(pageParam);

  const total = await prisma.track.count();
  const totalPages = totalPagesOf(total);

  // Si se borró el último elemento de una página, vuelve a la última que exista
  if (page > totalPages) {
    redirect(totalPages === 1 ? BASE_PATH : `${BASE_PATH}?page=${totalPages}`);
  }

  const tracks = await prisma.track.findMany({
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return (
    <main className="space-y-10 py-10">
      <header>
        <p className="text-sm uppercase tracking-widest text-muted">Panel del centro</p>
        <h1 className="font-serif text-4xl">Música</h1>
        <p className="mt-2 text-sm text-muted">
          Las pistas que subas aquí las asignas a cada tratamiento desde la pestaña Tratamientos.
        </p>
      </header>

      <section className="space-y-4">
        <TrackUploader />

        <h2 className="pt-4 font-serif text-2xl">Biblioteca ({total})</h2>

        {total === 0 && (
          <p className="text-sm text-muted">Aún no hay pistas. Sube la primera.</p>
        )}

        {tracks.map((t) => (
          <article
            key={t.id}
            className="space-y-3 rounded-3xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-medium">{t.title}</h3>
                <p className="text-sm text-muted">
                  {t.artist ? `${t.artist} · ` : ""}
                  {formatDuration(t.durationSec)} · {t.license}
                </p>
              </div>
              <DeleteTrackButton id={t.id} />
            </div>
            <audio controls preload="none" src={t.url} className="w-full" />
          </article>
        ))}

        <Pagination page={page} totalPages={totalPages} basePath={BASE_PATH} />
      </section>
    </main>
  );
}