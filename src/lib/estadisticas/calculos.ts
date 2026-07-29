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

export interface SaldoCuota {
  valorCuota: Decimal.Value;
  montoPagado: Decimal.Value;
}

export interface ResumenEstadisticas {
  totalPrestado: Decimal;
  totalRecuperado: Decimal;
  totalIntereses: Decimal;
  saldoTotalPendiente: Decimal;
}

export interface DatosResumenEstadisticas {
  montosPrestamos: Decimal.Value[];
  aplicaciones: AplicacionParaInteres[];
  cuotasActivas: SaldoCuota[];
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

  const totalIntereses = datos.aplicaciones.reduce<Decimal>(
    (acumulado, aplicacion) => acumulado.plus(interesDeAplicacion(aplicacion)),
    new Decimal(0),
  );

  const saldoTotalPendiente = datos.cuotasActivas.reduce<Decimal>(
    (acumulado, cuota) => acumulado.plus(new Decimal(cuota.valorCuota).minus(cuota.montoPagado)),
    new Decimal(0),
  );

  return { totalPrestado, totalRecuperado, totalIntereses, saldoTotalPendiente };
}
