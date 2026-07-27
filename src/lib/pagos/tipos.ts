import type { Decimal } from "@/lib/dinero";

/** Vista mínima de una cuota necesaria para repartir un pago sobre ella. */
export interface CuotaPendiente {
  id: string;
  numero: number;
  valorCuota: Decimal.Value;
  montoPagado: Decimal.Value;
}

export interface AplicacionCalculada {
  cuotaId: string;
  numero: number;
  montoAplicado: Decimal;
  nuevoMontoPagado: Decimal;
  nuevoEstado: "parcial" | "pagada";
}

export interface ResultadoAplicacionPago {
  aplicaciones: AplicacionCalculada[];
  /** Monto que no alcanzó a aplicarse por exceder el saldo pendiente total. */
  sobrante: Decimal;
}
