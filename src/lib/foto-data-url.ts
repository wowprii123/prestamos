import { z } from "zod";

/**
 * La foto llega como data URL JPEG ya comprimida en el navegador (ver
 * comprimir-imagen.ts). Esta validación es solo un respaldo defensivo por
 * si el campo se envía sin pasar por ese flujo.
 */
export const esquemaFotoDataUrl = z
  .string()
  .optional()
  .transform((valor) => (valor ? valor : undefined))
  .refine(
    (valor) => valor === undefined || /^data:image\/(jpeg|jpg|png|webp);base64,/.test(valor),
    { message: "Formato de foto inválido" },
  )
  .refine((valor) => valor === undefined || valor.length < 6_000_000, {
    message: "La foto es demasiado pesada",
  });
