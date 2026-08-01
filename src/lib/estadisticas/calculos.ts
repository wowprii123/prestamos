import { Decimal } from "@/lib/dinero";

export interface AplicacionParaInteres {
  montoAplicado: Decimal.Value;
  cuotaInteres: Decimal.Value;
  cuotaValorCuota: Decimal.Value;
}

/**
 * Proporción de interés contenida en un abono aplicado a una cuota. No
 * rastreamos el desglose interés/capital por abono individual, solo por
 * cuota completa, así que asumimos que cada abono reparte interés y capital
 * en la misma proporción que la cuota íntegra.
 */
export function interesDeAplicacion(aplicacion: AplicacionParaInteres): Decimal {
  const valorCuota = new Decimal(aplicacion.cuotaValorCuota);
  if (valorCuota.isZero()) return new Decimal(0);

  const proporcionInteres = new Decimal(aplicacion.cuotaInteres).div(valorCuota);
  return new Decimal(aplicacion.montoAplicado).mul(proporcionInteres);
}

export interface CuotaAbierta {
  valorCuota: Decimal.Value;
  montoPagado: Decimal.Value;
  interes: Decimal.Value;
}

/**
 * Interés que todavía falta cobrar de una cuota, proporcional a lo que le
 * queda pendiente (misma lógica de prorrateo que interesDeAplicacion, pero
 * sobre el saldo restante en vez de sobre un abono ya hecho).
 */
export function interesPendienteCuota(cuota: CuotaAbierta): Decimal {
  const valorCuota = new Decimal(cuota.valorCuota);
  if (valorCuota.isZero()) return new Decimal(0);

  const saldoPendiente = valorCuota.minus(cuota.montoPagado);
  const proporcionInteres = new Decimal(cuota.interes).div(valorCuota);
  return saldoPendiente.mul(proporcionInteres);
}

export interface ResumenEstadisticas {
  totalPrestado: Decimal;
  totalRecuperado: Decimal;
  /** Interés efectivamente cobrado (abonos dentro del rango). */
  interesesPagados: Decimal;
  /** Interés que todavía falta cobrar en préstamos abiertos (activo/en_mora), a hoy. */
  interesesFuturos: Decimal;
  saldoTotalPendiente: Decimal;
}

export interface DatosResumenEstadisticas {
  montosPrestamos: Decimal.Value[];
  aplicaciones: AplicacionParaInteres[];
  /** Cuotas de préstamos abiertos (activo/en_mora); alimenta saldoTotalPendiente e interesesFuturos. */
  cuotasAbiertas: CuotaAbierta[];
}

/** Agrega los totales de estadísticas a partir de datos ya consultados (sin acceso a DB). */
export function calcularResumenEstadisticas(
  datos: DatosResumenEstadisticas,
): ResumenEstadisticas {
  const totalPrestado = datos.montosPrestamos.reduce<Decimal>(
    (acumulado, monto) => acumulado.plus(monto),
    new Decimal(0),
  );

  const totalRecuperado = datos.aplicaciones.reduce<Decimal>(
    (acumulado, aplicacion) => acumulado.plus(aplicacion.montoAplicado),
    new Decimal(0),
  );

  const interesesPagados = datos.aplicaciones.reduce<Decimal>(
    (acumulado, aplicacion) => acumulado.plus(interesDeAplicacion(aplicacion)),
    new Decimal(0),
  );

  const saldoTotalPendiente = datos.cuotasAbiertas.reduce<Decimal>(
    (acumulado, cuota) => acumulado.plus(new Decimal(cuota.valorCuota).minus(cuota.montoPagado)),
    new Decimal(0),
  );

  const interesesFuturos = datos.cuotasAbiertas.reduce<Decimal>(
    (acumulado, cuota) => acumulado.plus(interesPendienteCuota(cuota)),
    new Decimal(0),
  );

  return { totalPrestado, totalRecuperado, interesesPagados, interesesFuturos, saldoTotalPendiente };
}
