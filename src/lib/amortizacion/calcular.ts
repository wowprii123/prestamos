import { Decimal, redondearMoneda } from "@/lib/dinero";
import type { Periodo } from "@/generated/prisma/enums";
import { fechaVencimientoCuota } from "./fechas";

export interface CuotaCalculada {
  numero: number;
  fechaVencimiento: Date;
  valorCuota: Decimal;
  interes: Decimal;
  capital: Decimal;
  saldoRestante: Decimal;
}

export interface ParametrosAmortizacion {
  monto: Decimal.Value;
  /** Tasa mensual; se prorratea según el período de pago (ver FACTOR_PERIODO). */
  tasaMensualPorcentaje: Decimal.Value;
  periodo: Periodo;
  numeroCuotas: number;
  fechaDesembolso: Date;
}

export interface TablaAmortizacion {
  valorCuota: Decimal;
  cuotas: CuotaCalculada[];
}

/**
 * Fracción del mes que representa cada período de pago. El interés de una
 * cuota es la tasa mensual prorrateada por esta fracción: una cuota
 * quincenal cobra la mitad del interés mensual, una semanal 7/30, etc.
 */
const FACTOR_PERIODO: Record<Periodo, Decimal.Value> = {
  diario: new Decimal(1).div(30),
  semanal: new Decimal(7).div(30),
  quincenal: new Decimal(1).div(2),
  mensual: new Decimal(1),
};

/**
 * Genera la tabla de amortización por interés simple (fijo): el capital se
 * reparte en partes iguales entre las cuotas (la última absorbe el residuo
 * de redondeo para que el saldo cierre en cero), y el interés de cada cuota
 * es la tasa mensual prorrateada por el período de pago, aplicada siempre
 * sobre el monto original (no sobre el saldo restante).
 */
export function generarTablaAmortizacion(
  parametros: ParametrosAmortizacion,
): TablaAmortizacion {
  const { monto, tasaMensualPorcentaje, periodo, numeroCuotas, fechaDesembolso } = parametros;

  if (numeroCuotas < 1) {
    throw new Error("El número de cuotas debe ser al menos 1");
  }

  const montoDecimal = new Decimal(monto);
  const tasaMensualFraccion = new Decimal(tasaMensualPorcentaje).div(100);

  const interesPorCuota = redondearMoneda(
    montoDecimal.mul(tasaMensualFraccion).mul(FACTOR_PERIODO[periodo]),
  );
  const capitalBase = redondearMoneda(montoDecimal.div(numeroCuotas));

  const cuotas: CuotaCalculada[] = [];
  let saldoRestante = montoDecimal;

  for (let numero = 1; numero <= numeroCuotas; numero++) {
    const esUltimaCuota = numero === numeroCuotas;

    const capital = esUltimaCuota ? saldoRestante : capitalBase;
    saldoRestante = esUltimaCuota
      ? new Decimal(0)
      : redondearMoneda(saldoRestante.minus(capital));

    cuotas.push({
      numero,
      fechaVencimiento: fechaVencimientoCuota(fechaDesembolso, periodo, numero),
      valorCuota: redondearMoneda(capital.plus(interesPorCuota)),
      interes: interesPorCuota,
      capital,
      saldoRestante,
    });
  }

  return { valorCuota: redondearMoneda(capitalBase.plus(interesPorCuota)), cuotas };
}
