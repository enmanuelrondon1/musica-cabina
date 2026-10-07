// cat src/components/admin/delete-track-button.tsx

"use client";

import { useTransition } from "react";
import { deleteTrack } from "@/app/admin/actions";

export function DeleteTrackButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("¿Eliminar esta pista? También se borrará de Cloudinary.")) return;
    startTransition(async () => {
      await deleteTrack(id);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="text-sm text-terracotta transition hover:underline disabled:opacity-50"
    >
      {pending ? "Eliminando…" : "Eliminar"}
    </button>
  );
}