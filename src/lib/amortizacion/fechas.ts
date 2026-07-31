import type { Periodo } from "@/generated/prisma/enums";
import { addDiasUTC, addMesesUTC } from "@/lib/fecha-utc";

function ultimoDiaDelMesUTC(anio: number, mesIndiceCero: number): number {
  return new Date(Date.UTC(anio, mesIndiceCero + 1, 0)).getUTCDate();
}

/**
 * Cuotas quincenales caen siempre en el día 15 y el día 30 del mes (nunca el
 * 31; en febrero, que no tiene día 30, cae en el último día del mes). Contar
 * "cada 15 días" desde el desembolso se desalinea del calendario apenas hay
 * un mes de 31 días de por medio, así que en vez de eso se ancla a estos
 * dos puntos fijos del calendario.
 */
function fechaQuincenal(fechaDesembolso: Date, numero: number): Date {
  let anio = fechaDesembolso.getUTCFullYear();
  let mes = fechaDesembolso.getUTCMonth();
  let encontradas = 0;

  for (;;) {
    const finDeMes = ultimoDiaDelMesUTC(anio, mes);
    const anclas = [15, Math.min(30, finDeMes)];

    for (const dia of anclas) {
      const candidato = new Date(Date.UTC(anio, mes, dia));
      if (candidato.getTime() > fechaDesembolso.getTime()) {
        encontradas += 1;
        if (encontradas === numero) return candidato;
      }
    }

    mes += 1;
    if (mes > 11) {
      mes = 0;
      anio += 1;
    }
  }
}

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
      return fechaQuincenal(fechaDesembolso, numero);
    case "mensual":
      return addMesesUTC(fechaDesembolso, numero);
  }
}
