"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { enviarExtractoPorCorreo } from "@/lib/servicios/extractos";

export interface ResultadoEnvioExtracto {
  ok: boolean;
  mensaje: string;
}

const esquemaEnvio = z.object({
  prestamoId: z.string().min(1),
  tipo: z.enum(["mensual", "acumulado"]),
  mes: z.string().optional(),
});

export async function enviarExtractoAction(
  _estadoPrevio: ResultadoEnvioExtracto | undefined,
  formData: FormData,
): Promise<ResultadoEnvioExtracto> {
  const session = await auth();
  if (!session || session.user.rol !== "admin") {
    return { ok: false, mensaje: "No autorizado" };
  }

  const parsed = esquemaEnvio.safeParse({
    prestamoId: formData.get("prestamoId"),
    tipo: formData.get("tipo"),
    mes: formData.get("mes") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, mensaje: "Datos inválidos" };
  }

  const fechaReferencia = parsed.data.mes
    ? new Date(`${parsed.data.mes}-01T00:00:00.000Z`)
    : new Date();

  try {
    await enviarExtractoPorCorreo(parsed.data.prestamoId, parsed.data.tipo, fechaReferencia);
  } catch (error) {
    return {
      ok: false,
      mensaje: error instanceof Error ? error.message : "Error inesperado al enviar el correo",
    };
  }

  revalidatePath(`/admin/prestamos/${parsed.data.prestamoId}`);
  return { ok: true, mensaje: "Extracto enviado correctamente" };
}
