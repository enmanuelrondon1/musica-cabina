//src/lib/validations.ts

import { z } from "zod";

export const ambienceValues = ["CALM", "NATURE", "ENERGIZING", "MEDITATIVE"] as const;

export const treatmentSchema = z.object({
  name: z.string().trim().min(2, "El nombre es muy corto").max(80, "El nombre es muy largo"),
  description: z.string().trim().max(300, "La descripción es muy larga").optional(),
  durationMin: z.coerce
    .number()
    .int("La duración debe ser un número entero")
    .min(1, "La duración mínima es 1 minuto")
    .max(240, "La duración máxima es 240 minutos"),
  ambience: z.enum(ambienceValues),
});

export const trackSchema = z.object({
  title: z.string().trim().min(2, "El título es muy corto").max(120),
  artist: z.string().trim().max(120).optional(),
  url: z.string().url(),
  publicId: z.string().min(1),
  durationSec: z.coerce.number().min(1),
  license: z.string().trim().min(2, "Indica la licencia de la pista").max(200),
});

export type TreatmentInput = z.infer<typeof treatmentSchema>;
export type TrackInput = z.infer<typeof trackSchema>;