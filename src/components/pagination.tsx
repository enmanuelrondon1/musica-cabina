// src/components/pagination.tsx

import Link from "next/link";

type Props = {
  page: number;
  totalPages: number;
  basePath: string;
};

const activeClass =
  "rounded-full border border-border bg-card px-5 py-2 text-sm transition hover:bg-background";
const disabledClass =
  "rounded-full border border-border px-5 py-2 text-sm text-muted opacity-50";

export function Pagination({ page, totalPages, basePath }: Props) {
  if (totalPages <= 1) return null;

  const href = (p: number) => (p === 1 ? basePath : `${basePath}?page=${p}`);

  return (
    <nav aria-label="Paginación" className="flex items-center justify-between gap-4 pt-2">
      {page > 1 ? (
        <Link href={href(page - 1)} className={activeClass}>
          ← Anterior
        </Link>
      ) : (
        <span aria-disabled="true" className={disabledClass}>
          ← Anterior
        </span>
      )}

      <span className="text-sm text-muted">
        Página {page} de {totalPages}
      </span>

      {page < totalPages ? (
        <Link href={href(page + 1)} className={activeClass}>
          Siguiente →
        </Link>
      ) : (
        <span aria-disabled="true" className={disabledClass}>
          Siguiente →
        </span>
      )}
    </nav>
  );
}