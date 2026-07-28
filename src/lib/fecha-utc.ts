/**
 * Aritmética de fechas en UTC. Todas las fechas del dominio son fechas puras
 * (sin hora) y se manipulan con getters/setters UTC, nunca locales: así el
 * resultado no cambia según la zona horaria del servidor (p. ej. un servidor
 * en America/Bogota haciendo aritmética de calendario local puede desfasar
 * en un día la fecha mostrada frente a la fecha ingresada).
 */

export function inicioDeDiaUTC(fecha: Date): Date {
  return new Date(Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate()));
}

export function addDiasUTC(fecha: Date, dias: number): Date {
  const resultado = new Date(fecha);
  resultado.setUTCDate(resultado.getUTCDate() + dias);
  return resultado;
}

export function addMesesUTC(fecha: Date, meses: number): Date {
  const resultado = new Date(fecha);
  resultado.setUTCMonth(resultado.getUTCMonth() + meses);
  return resultado;
}

const MS_POR_DIA = 24 * 60 * 60 * 1000;

/** Días entre dos fechas (fechaA - fechaB), ignorando la hora. Positivo si fechaA es posterior. */
export function diferenciaEnDias(fechaA: Date, fechaB: Date): number {
  return Math.round(
    (inicioDeDiaUTC(fechaA).getTime() - inicioDeDiaUTC(fechaB).getTime()) / MS_POR_DIA,
  );
}
