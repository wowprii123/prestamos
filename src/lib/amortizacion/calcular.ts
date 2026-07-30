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
  /** Tasa sobre el monto total del préstamo (no por cuota, no se convierte por período). */
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
 * Genera la tabla de amortización por interés simple (fijo): el interés
 * total del préstamo (monto × tasa) y el capital se reparten en partes
 * iguales entre las cuotas. La última cuota absorbe el residuo de redondeo
 * de ambos para que capital e interés cierren exactos.
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

  const interesTotal = redondearMoneda(montoDecimal.mul(tasaFraccion));
  const interesPorCuotaBase = redondearMoneda(interesTotal.div(numeroCuotas));
  const capitalBase = redondearMoneda(montoDecimal.div(numeroCuotas));

  const cuotas: CuotaCalculada[] = [];
  let saldoRestante = montoDecimal;
  let interesAcumulado = new Decimal(0);

  for (let numero = 1; numero <= numeroCuotas; numero++) {
    const esUltimaCuota = numero === numeroCuotas;

    const capital = esUltimaCuota ? saldoRestante : capitalBase;
    saldoRestante = esUltimaCuota
      ? new Decimal(0)
      : redondearMoneda(saldoRestante.minus(capital));

    const interes = esUltimaCuota
      ? redondearMoneda(interesTotal.minus(interesAcumulado))
      : interesPorCuotaBase;
    interesAcumulado = interesAcumulado.plus(interes);

    cuotas.push({
      numero,
      fechaVencimiento: fechaVencimientoCuota(fechaDesembolso, periodo, numero),
      valorCuota: redondearMoneda(capital.plus(interes)),
      interes,
      capital,
      saldoRestante,
    });
  }

  return { valorCuota: redondearMoneda(capitalBase.plus(interesPorCuotaBase)), cuotas };
}
