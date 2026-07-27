import { Decimal } from "@/lib/dinero";
import type { Periodo } from "@/generated/prisma/enums";

/**
 * Factor de conversión de una tasa mensual a la tasa del período del préstamo.
 * Conversión proporcional (no compuesta): así se cotiza habitualmente en
 * préstamos informales, y es lo que el admin espera al pensar "tasa mensual".
 */
const FACTOR_PERIODO: Record<Periodo, Decimal.Value> = {
  diario: new Decimal(1).div(30),
  semanal: new Decimal(7).div(30),
  quincenal: new Decimal(1).div(2),
  mensual: new Decimal(1),
};

/**
 * Convierte una tasa mensual expresada en porcentaje (ej. 5 = 5%) a la tasa
 * fraccional del período (ej. 0.05 mensual -> 0.011666... semanal).
 */
export function tasaMensualATasaPeriodo(
  tasaMensualPorcentaje: Decimal.Value,
  periodo: Periodo,
): Decimal {
  const tasaMensualFraccion = new Decimal(tasaMensualPorcentaje).div(100);
  return tasaMensualFraccion.mul(FACTOR_PERIODO[periodo]);
}
