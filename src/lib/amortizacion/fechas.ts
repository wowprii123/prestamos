import type { Periodo } from "@/generated/prisma/enums";
import { addDiasUTC, addMesesUTC } from "@/lib/fecha-utc";

/** Fecha de vencimiento de la cuota número `numero` (1-indexado) del préstamo. */
export function fechaVencimientoCuota(
  fechaDesembolso: Date,
  periodo: Periodo,
  numero: number,
): Date {
  switch (periodo) {
    case "diario":
      return addDiasUTC(fechaDesembolso, numero);
    case "semanal":
      return addDiasUTC(fechaDesembolso, numero * 7);
    case "quincenal":
      return addDiasUTC(fechaDesembolso, numero * 15);
    case "mensual":
      return addMesesUTC(fechaDesembolso, numero);
  }
}
