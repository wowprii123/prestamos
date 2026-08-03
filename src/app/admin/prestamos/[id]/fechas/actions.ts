"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { actualizarFechasCuotas, type FechaCuota } from "@/lib/servicios/prestamos";

export async function actualizarFechasAction(
  _estadoPrevio: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  const session = await auth();
  if (!session) return "No autorizado";

  const prestamoId = formData.get("prestamoId");
  if (typeof prestamoId !== "string" || !prestamoId) return "Datos inválidos";

  const fechas: FechaCuota[] = [];
  for (const [clave, valor] of formData.entries()) {
    if (!clave.startsWith("fecha_") || typeof valor !== "string" || !valor) continue;

    const fechaVencimiento = new Date(valor);
    if (Number.isNaN(fechaVencimiento.getTime())) return "Una de las fechas ingresadas no es válida";

    fechas.push({ cuotaId: clave.slice("fecha_".length), fechaVencimiento });
  }

  if (fechas.length === 0) return "No hay fechas para guardar";

  try {
    await actualizarFechasCuotas(prestamoId, fechas);
  } catch (error) {
    return error instanceof Error ? error.message : "Error inesperado";
  }

  redirect(`/admin/prestamos/${prestamoId}`);
}
