import { Decimal, redondearMoneda } from "@/lib/dinero";
import type {
  AplicacionCalculada,
  CuotaPendiente,
  ResultadoAplicacionPago,
} from "./tipos";

/** Saldo pendiente de una cuota individual (nunca negativo). */
export function saldoPendienteCuota(cuota: CuotaPendiente): Decimal {
  const saldo = new Decimal(cuota.valorCuota).minus(cuota.montoPagado);
  return saldo.isNegative() ? new Decimal(0) : redondearMoneda(saldo);
}

/** Saldo pendiente total de un préstamo (suma del saldo de todas sus cuotas). */
export function saldoPendientePrestamo(cuotas: CuotaPendiente[]): Decimal {
  return cuotas.reduce(
    (acumulado, cuota) => acumulado.plus(saldoPendienteCuota(cuota)),
    new Decimal(0),
  );
}

/**
 * Reparte `montoPago` entre las cuotas pendientes, de la más antigua a la
 * más reciente. Si el monto no cubre una cuota completa, esta queda en
 * estado `parcial` (el caso de "abono"). Si el monto excede el saldo total
 * pendiente, el excedente se devuelve en `sobrante` para que el llamador
 * decida qué hacer (rechazar, o dejarlo como saldo a favor).
 */
export function aplicarPago(
  cuotasPendientes: CuotaPendiente[],
  montoPago: Decimal.Value,
): ResultadoAplicacionPago {
  const cuotasOrdenadas = [...cuotasPendientes].sort((a, b) => a.numero - b.numero);

  let restante = new Decimal(montoPago);
  if (restante.lte(0)) {
    throw new Error("El monto del pago debe ser mayor a cero");
  }

  const aplicaciones: AplicacionCalculada[] = [];

  for (const cuota of cuotasOrdenadas) {
    if (restante.lte(0)) break;

    const saldoCuota = saldoPendienteCuota(cuota);
    if (saldoCuota.lte(0)) continue;

    const montoAplicado = Decimal.min(restante, saldoCuota);
    const nuevoMontoPagado = redondearMoneda(
      new Decimal(cuota.montoPagado).plus(montoAplicado),
    );
    const nuevoEstado = nuevoMontoPagado.gte(new Decimal(cuota.valorCuota))
      ? ("pagada" as const)
      : ("parcial" as const);

    aplicaciones.push({
      cuotaId: cuota.id,
      numero: cuota.numero,
      montoAplicado,
      nuevoMontoPagado,
      nuevoEstado,
    });

    restante = restante.minus(montoAplicado);
  }

  return { aplicaciones, sobrante: redondearMoneda(restante) };
}
