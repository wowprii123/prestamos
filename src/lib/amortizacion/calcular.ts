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
  /** Tasa que se cobra completa en cada cuota (no se convierte por período). */
  tasaPorcentaje: Decimal.Value;
  /** Determina la cadencia de los vencimientos; no afecta el cálculo de interés. */
  periodo: Periodo;
  numeroCuotas: number;
  fechaDesembolso: Date;
}

export interface TablaAmortizacion {
  valorCuota: Decimal;
  cuotas: CuotaCalculada[];
}

/**
 * Genera la tabla de amortización por interés simple (fijo): el capital se
 * reparte en partes iguales entre las cuotas, y el interés es el mismo
 * monto en cada cuota (monto prestado × tasa), sin importar cuánto capital
 * ya se haya pagado. La última cuota absorbe el residuo de redondeo del
 * capital para que el saldo cierre exactamente en cero.
 */
export function generarTablaAmortizacion(
  parametros: ParametrosAmortizacion,
): TablaAmortizacion {
  const { monto, tasaPorcentaje, periodo, numeroCuotas, fechaDesembolso } = parametros;

  if (numeroCuotas < 1) {
    throw new Error("El número de cuotas debe ser al menos 1");
  }

  const montoDecimal = new Decimal(monto);
  const tasaFraccion = new Decimal(tasaPorcentaje).div(100);

  const interesPorCuota = redondearMoneda(montoDecimal.mul(tasaFraccion));
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
