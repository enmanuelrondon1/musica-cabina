// src/app/admin/actions.ts

"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { cloudinary } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import {
  treatmentSchema,
  trackSchema,
  type TreatmentInput,
  type TrackInput,
} from "@/lib/validations";

type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const UPLOAD_FOLDER = "musica-cabina/tracks";
const UNAUTHORIZED = { ok: false, error: "No autorizado" } as const;

// Las Server Actions son endpoints públicos: cada una comprueba la sesión por sí misma
async function isAdmin() {
  const session = await auth();
  return Boolean(session?.user);
}

function refresh() {
  revalidatePath("/admin", "layout");
  revalidatePath("/");
}

// ---------- Cloudinary ----------

export async function getUploadSignature() {
  if (!(await isAdmin())) throw new Error("No autorizado");

  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: UPLOAD_FOLDER },
    process.env.CLOUDINARY_API_SECRET as string
  );

  return {
    timestamp,
    folder: UPLOAD_FOLDER,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY as string,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME as string,
  };
}

// ---------- Tracks ----------

export async function createTrack(input: TrackInput): Promise<ActionResult<{ id: string }>> {
  if (!(await isAdmin())) return UNAUTHORIZED;

  const parsed = trackSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { title, artist, url, publicId, durationSec, license } = parsed.data;
  const track = await prisma.track.create({
    data: {
      title,
      artist: artist || null,
      url,
      publicId,
      durationSec: Math.round(durationSec),
      license,
    },
  });

  refresh();
  return { ok: true, data: { id: track.id } };
}

export async function deleteTrack(id: string): Promise<ActionResult> {
  if (!(await isAdmin())) return UNAUTHORIZED;

  const track = await prisma.track.findUnique({ where: { id } });
  if (!track) return { ok: false, error: "La pista no existe" };

  // El audio se guarda en Cloudinary como resource_type "video"
  await cloudinary.uploader.destroy(track.publicId, { resource_type: "video" });
  await prisma.track.delete({ where: { id } });

  refresh();
  return { ok: true, data: undefined };
}

// ---------- Tratamientos ----------

export async function createTreatment(
  input: TreatmentInput
): Promise<ActionResult<{ id: string }>> {
  if (!(await isAdmin())) return UNAUTHORIZED;

  const parsed = treatmentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { name, description, durationMin, ambience } = parsed.data;
  const treatment = await prisma.treatment.create({
    data: { name, description: description || null, durationMin, ambience },
  });

  refresh();
  return { ok: true, data: { id: treatment.id } };
}

export async function updateTreatment(
  id: string,
  input: TreatmentInput
): Promise<ActionResult> {
  if (!(await isAdmin())) return UNAUTHORIZED;

  const parsed = treatmentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { name, description, durationMin, ambience } = parsed.data;
  await prisma.treatment.update({
    where: { id },
    data: { name, description: description || null, durationMin, ambience },
  });

  refresh();
  return { ok: true, data: undefined };
}

export async function deleteTreatment(id: string): Promise<ActionResult> {
  if (!(await isAdmin())) return UNAUTHORIZED;

  await prisma.treatment.delete({ where: { id } });
  refresh();
  return { ok: true, data: undefined };
}

// Reemplaza las pistas asignadas; el orden del array define la posición del loop
export async function setTreatmentTracks(
  treatmentId: string,
  trackIds: string[]
): Promise<ActionResult> {
  if (!(await isAdmin())) return UNAUTHORIZED;

  const uniqueIds = [...new Set(trackIds)];

  await prisma.$transaction([
    prisma.treatmentTrack.deleteMany({ where: { treatmentId } }),
    prisma.treatmentTrack.createMany({
      data: uniqueIds.map((trackId, position) => ({ treatmentId, trackId, position })),
    }),
  ]);

  refresh();
  return { ok: true, data: undefined };
}