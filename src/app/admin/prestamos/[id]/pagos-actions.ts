"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { registrarPago } from "@/lib/servicios/pagos";

export async function registrarPagoRecomendadoAction(prestamoId: string) {
  const session = await auth();
  if (!session) throw new Error("No autorizado");

  await registrarPago({
    prestamoId,
    tipo: "recomendado",
    registradoPorId: session.user.id,
  });

  revalidatePath(`/admin/prestamos/${prestamoId}`);
}

const esquemaPagoLibre = z.object({
  prestamoId: z.string().min(1),
  monto: z.coerce.number().positive("El monto debe ser mayor a cero"),
  medioPago: z.string().optional(),
  nota: z.string().optional(),
});

export async function registrarPagoLibreAction(
  _estadoPrevio: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  const session = await auth();
  if (!session) return "No autorizado";

  const parsed = esquemaPagoLibre.safeParse({
    prestamoId: formData.get("prestamoId"),
    monto: formData.get("monto"),
    medioPago: formData.get("medioPago") || undefined,
    nota: formData.get("nota") || undefined,
  });
  if (!parsed.success) return parsed.error.issues[0].message;

  try {
    await registrarPago({
      prestamoId: parsed.data.prestamoId,
      tipo: "libre",
      monto: parsed.data.monto,
      medioPago: parsed.data.medioPago,
      nota: parsed.data.nota,
      registradoPorId: session.user.id,
    });
  } catch (error) {
    return error instanceof Error ? error.message : "Error inesperado";
  }

  revalidatePath(`/admin/prestamos/${parsed.data.prestamoId}`);
}
