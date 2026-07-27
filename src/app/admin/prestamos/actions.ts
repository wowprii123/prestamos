"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";
import { crearPrestamo } from "@/lib/servicios/prestamos";

const esquemaPrestamo = z.object({
  clienteId: z.string().min(1, "Selecciona un cliente"),
  monto: z.coerce.number().positive("El monto debe ser mayor a cero"),
  tasaMensualPorcentaje: z.coerce
    .number()
    .nonnegative("La tasa no puede ser negativa"),
  periodo: z.enum(["diario", "semanal", "quincenal", "mensual"]),
  numeroCuotas: z.coerce.number().int().min(1, "Debe haber al menos 1 cuota"),
  fechaDesembolso: z.coerce.date(),
});

export async function crearPrestamoAction(
  _estadoPrevio: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  const session = await auth();
  if (!session || session.user.rol !== "admin") return "No autorizado";

  const parsed = esquemaPrestamo.safeParse({
    clienteId: formData.get("clienteId"),
    monto: formData.get("monto"),
    tasaMensualPorcentaje: formData.get("tasaMensualPorcentaje"),
    periodo: formData.get("periodo"),
    numeroCuotas: formData.get("numeroCuotas"),
    fechaDesembolso: formData.get("fechaDesembolso"),
  });
  if (!parsed.success) return parsed.error.issues[0].message;

  let prestamoId: string;
  try {
    const prestamo = await crearPrestamo({
      ...parsed.data,
      creadoPorId: session.user.id,
    });
    prestamoId = prestamo.id;
  } catch (error) {
    return error instanceof Error ? error.message : "Error inesperado";
  }

  redirect(`/admin/prestamos/${prestamoId}`);
}
