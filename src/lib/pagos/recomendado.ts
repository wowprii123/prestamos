import { Decimal } from "@/lib/dinero";
import { saldoPendienteCuota } from "./aplicar";
import type { CuotaPendiente } from "./tipos";

/**
 * Monto del "pago recomendado": el saldo pendiente de la cuota más antigua
 * que aún no está completamente pagada. Null si no hay cuotas pendientes.
 */
export function montoRecomendado(cuotasPendientes: CuotaPendiente[]): Decimal | null {
  const cuotasOrdenadas = [...cuotasPendientes].sort((a, b) => a.numero - b.numero);

  for (const cuota of cuotasOrdenadas) {
    const saldo = saldoPendienteCuota(cuota);
    if (saldo.gt(0)) return saldo;
  }

  return null;
}
