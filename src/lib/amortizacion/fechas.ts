import type { Periodo } from "@/generated/prisma/enums";

/**
 * Todas las fechas del dominio se tratan como fechas puras (sin hora), y se
 * manipulan en UTC en vez de con getters/setters locales. Esto evita que el
 * cálculo de vencimientos cambie según la zona horaria del servidor (p. ej.
 * un servidor en America/Bogota corriendo aritmética de calendario local
 * puede desfasar la fecha mostrada en un día frente a la fecha ingresada).
 */
function addDiasUTC(fecha: Date, dias: number): Date {
  const resultado = new Date(fecha);
  resultado.setUTCDate(resultado.getUTCDate() + dias);
  return resultado;
}

function addMesesUTC(fecha: Date, meses: number): Date {
  const resultado = new Date(fecha);
  resultado.setUTCMonth(resultado.getUTCMonth() + meses);
  return resultado;
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
      return addDiasUTC(fechaDesembolso, numero * 15);
    case "mensual":
      return addMesesUTC(fechaDesembolso, numero);
  }
}
