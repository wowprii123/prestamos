/**
 * Límites de un mes calendario en UTC (medianoche a medianoche), en línea
 * con la convención de fechas puras usada en todo el dominio. Ver la nota
 * en lib/amortizacion/fechas.ts.
 */
export function inicioDeMesUTC(fecha: Date): Date {
  return new Date(Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), 1));
}

export function finDeMesUTC(fecha: Date): Date {
  return new Date(
    Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth() + 1, 0, 23, 59, 59, 999),
  );
}
