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

/** Último instante (23:59:59.999) del día calendario UTC de `fecha`. */
export function finDeDiaUTC(fecha: Date): Date {
  return new Date(inicioDeDiaUTC(fecha).getTime() + 24 * 60 * 60 * 1000 - 1);
}

export function addDiasUTC(fecha: Date, dias: number): Date {
  const resultado = new Date(fecha);
  resultado.setUTCDate(resultado.getUTCDate() + dias);
  return resultado;
}

/**
 * Suma meses a una fecha sin desbordarse al mes siguiente cuando el mes
 * destino tiene menos días que el día original: 31 de julio + 1 mes debe
 * dar 31 de agosto, pero + 2 meses debe dar 30 de septiembre (no "1 de
 * octubre", que es lo que produce `setUTCMonth` al desbordarse porque
 * septiembre no tiene día 31).
 */
export function addMesesUTC(fecha: Date, meses: number): Date {
  const anio = fecha.getUTCFullYear();
  const mesIndice = fecha.getUTCMonth() + meses;
  const dia = fecha.getUTCDate();

  const ultimoDiaDelMesDestino = new Date(Date.UTC(anio, mesIndice + 1, 0)).getUTCDate();
  const diaFinal = Math.min(dia, ultimoDiaDelMesDestino);

  return new Date(Date.UTC(anio, mesIndice, diaFinal));
}

const MS_POR_DIA = 24 * 60 * 60 * 1000;

/** Días entre dos fechas (fechaA - fechaB), ignorando la hora. Positivo si fechaA es posterior. */
export function diferenciaEnDias(fechaA: Date, fechaB: Date): number {
  return Math.round(
    (inicioDeDiaUTC(fechaA).getTime() - inicioDeDiaUTC(fechaB).getTime()) / MS_POR_DIA,
  );
}
