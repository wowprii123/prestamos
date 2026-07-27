import { Decimal } from "decimal.js";

Decimal.set({ precision: 30, rounding: Decimal.ROUND_HALF_UP });

/** Redondea un valor monetario a 2 decimales (centavos). */
export function redondearMoneda(valor: Decimal.Value): Decimal {
  return new Decimal(valor).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

export { Decimal };
