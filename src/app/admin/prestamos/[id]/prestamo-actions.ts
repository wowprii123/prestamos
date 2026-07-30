"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { anularPrestamo } from "@/lib/servicios/prestamos";

export interface ResultadoAnulacion {
  ok: boolean;
  mensaje?: string;
}

export async function anularPrestamoAction(prestamoId: string): Promise<ResultadoAnulacion> {
  const session = await auth();
  if (!session) return { ok: false, mensaje: "No autorizado" };

  try {
    await anularPrestamo(prestamoId);
  } catch (error) {
    return {
      ok: false,
      mensaje: error instanceof Error ? error.message : "Error inesperado",
    };
  }

  revalidatePath(`/admin/prestamos/${prestamoId}`);
  revalidatePath("/admin/prestamos");
  return { ok: true };
}
