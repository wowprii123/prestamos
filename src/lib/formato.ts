import { Decimal } from "@/lib/dinero";

const formateadorMoneda = new Intl.NumberFormat("es-CO", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatearMoneda(valor: Decimal.Value): string {
  return "$" + formateadorMoneda.format(new Decimal(valor).toNumber());
}

// timeZone: "UTC" es obligatorio: las fechas del dominio son fechas puras
// (medianoche UTC) y deben mostrarse igual sin importar la zona horaria del
// servidor. Ver la nota en lib/amortizacion/fechas.ts.
const formateadorFecha = new Intl.DateTimeFormat("es-CO", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export function formatearFecha(valor: Date): string {
  return formateadorFecha.format(valor);
}

const ETIQUETAS_PERIODO: Record<string, string> = {
  diario: "Diario",
  semanal: "Semanal",
  quincenal: "Quincenal",
  mensual: "Mensual",
};

export function formatearPeriodo(periodo: string): string {
  return ETIQUETAS_PERIODO[periodo] ?? periodo;
}

const ETIQUETAS_ESTADO_PRESTAMO: Record<string, string> = {
  activo: "Activo",
  pagado: "Pagado",
  en_mora: "En mora",
  cancelado: "Cancelado",
};

export function formatearEstadoPrestamo(estado: string): string {
  return ETIQUETAS_ESTADO_PRESTAMO[estado] ?? estado;
}

const ETIQUETAS_ESTADO_CUOTA: Record<string, string> = {
  pendiente: "Pendiente",
  parcial: "Parcial",
  pagada: "Pagada",
  vencida: "Vencida",
};

export function formatearEstadoCuota(estado: string): string {
  return ETIQUETAS_ESTADO_CUOTA[estado] ?? estado;
}
