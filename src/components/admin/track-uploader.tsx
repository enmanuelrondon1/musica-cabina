// cat src/components/admin/track-uploader.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTrack, getUploadSignature } from "@/app/admin/actions";

const MAX_MB = 30;

type Signature = Awaited<ReturnType<typeof getUploadSignature>>;

type CloudinaryResponse = {
  secure_url: string;
  public_id: string;
  duration?: number;
  error?: { message: string };
};

function uploadToCloudinary(
  file: File,
  sig: Signature,
  onProgress: (pct: number) => void
): Promise<CloudinaryResponse> {
  return new Promise((resolve, reject) => {
    const body = new FormData();
    body.append("file", file);
    body.append("api_key", sig.apiKey);
    body.append("timestamp", String(sig.timestamp));
    body.append("folder", sig.folder);
    body.append("signature", sig.signature);

    const xhr = new XMLHttpRequest();
    // Cloudinary trata el audio como resource_type "video"
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${sig.cloudName}/video/upload`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      try {
        const res = JSON.parse(xhr.responseText) as CloudinaryResponse;
        if (xhr.status >= 200 && xhr.status < 300) resolve(res);
        else reject(new Error(res.error?.message ?? "Error al subir el audio"));
      } catch {
        reject(new Error("Respuesta inesperada de Cloudinary"));
      }
    };
    xhr.onerror = () => reject(new Error("Error de red al subir el audio"));
    xhr.send(body);
  });
}

const inputClass =
  "w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-sage-dark";

export function TrackUploader() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget; // se captura antes de los await
    const data = new FormData(form);
    const file = data.get("file") as File | null;

    setError(null);

    if (!file || file.size === 0) return setError("Selecciona un archivo de audio");
    if (!file.type.startsWith("audio/")) return setError("El archivo debe ser un audio");
    if (file.size > MAX_MB * 1024 * 1024) return setError(`El audio supera los ${MAX_MB} MB`);

    setLoading(true);
    setProgress(0);

    try {
      const sig = await getUploadSignature();
      const uploaded = await uploadToCloudinary(file, sig, setProgress);

      const result = await createTrack({
        title: String(data.get("title") ?? ""),
        artist: String(data.get("artist") ?? "") || undefined,
        license: String(data.get("license") ?? ""),
        url: uploaded.secure_url,
        publicId: uploaded.public_id,
        durationSec: uploaded.duration ?? 0,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      form.reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-sm"
    >
      <h2 className="font-serif text-2xl">Subir pista</h2>

      <input name="title" placeholder="Título" required className={inputClass} />
      <input name="artist" placeholder="Artista (opcional)" className={inputClass} />
      <input
        name="license"
        placeholder="Licencia (ej. CC0, Pixabay Content License)"
        required
        className={inputClass}
      />
      <input
        name="file"
        type="file"
        accept="audio/*"
        required
        className="w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-sage file:px-4 file:py-2 file:text-sm file:text-white"
      />

      {loading && (
        <div className="h-2 overflow-hidden rounded-full bg-border">
          <div
            className="h-full bg-sage-dark transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {error && <p className="text-sm text-terracotta">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-sage-dark px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {loading ? `Subiendo… ${progress}%` : "Subir pista"}
      </button>
    </form>
  );
}