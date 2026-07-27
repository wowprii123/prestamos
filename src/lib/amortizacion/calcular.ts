import { Decimal, redondearMoneda } from "@/lib/dinero";
import type { Periodo } from "@/generated/prisma/enums";
import { tasaMensualATasaPeriodo } from "./tasas";
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
  tasaMensualPorcentaje: Decimal.Value;
  periodo: Periodo;
  numeroCuotas: number;
  fechaDesembolso: Date;
}

export interface TablaAmortizacion {
  tasaPeriodo: Decimal;
  valorCuota: Decimal;
  cuotas: CuotaCalculada[];
}

/**
 * Genera la tabla de amortización por sistema francés: cuota fija, interés
 * calculado sobre el saldo pendiente. La última cuota absorbe el residuo de
 * redondeo para que el saldo cierre exactamente en cero.
 */
export function generarTablaAmortizacion(
  parametros: ParametrosAmortizacion,
): TablaAmortizacion {
  const { monto, tasaMensualPorcentaje, periodo, numeroCuotas, fechaDesembolso } =
    parametros;

  if (numeroCuotas < 1) {
    throw new Error("El número de cuotas debe ser al menos 1");
  }

  const montoDecimal = new Decimal(monto);
  const tasaPeriodo = tasaMensualATasaPeriodo(tasaMensualPorcentaje, periodo);

  const valorCuota = calcularCuotaFija(montoDecimal, tasaPeriodo, numeroCuotas);

  const cuotas: CuotaCalculada[] = [];
  let saldoAnterior = montoDecimal;

  for (let numero = 1; numero <= numeroCuotas; numero++) {
    const esUltimaCuota = numero === numeroCuotas;
    const interes = redondearMoneda(saldoAnterior.mul(tasaPeriodo));

    const capital = esUltimaCuota
      ? saldoAnterior
      : redondearMoneda(valorCuota.minus(interes));

    const saldoRestante = esUltimaCuota
      ? new Decimal(0)
      : redondearMoneda(saldoAnterior.minus(capital));

    cuotas.push({
      numero,
      fechaVencimiento: fechaVencimientoCuota(fechaDesembolso, periodo, numero),
      valorCuota: esUltimaCuota ? redondearMoneda(interes.plus(capital)) : valorCuota,
      interes,
      capital,
      saldoRestante,
    });

    saldoAnterior = saldoRestante;
  }

  return { tasaPeriodo, valorCuota, cuotas };
}

/** cuota = monto * i / (1 - (1+i)^-n) */
function calcularCuotaFija(
  monto: Decimal,
  tasaPeriodo: Decimal,
  numeroCuotas: number,
): Decimal {
  if (tasaPeriodo.isZero()) {
    return redondearMoneda(monto.div(numeroCuotas));
  }

  const factor = tasaPeriodo.div(
    new Decimal(1).minus(new Decimal(1).plus(tasaPeriodo).pow(-numeroCuotas)),
  );

  return redondearMoneda(monto.mul(factor));
}
