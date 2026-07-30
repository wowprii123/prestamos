import { prisma } from "@/lib/db";
import { generarTablaAmortizacion } from "@/lib/amortizacion";
import { saldoPendientePrestamo } from "@/lib/pagos";
import type { EstadoPrestamo, Periodo } from "@/generated/prisma/enums";

export type FiltroEstadoPrestamo = "activos" | "finalizados";

export const ESTADOS_POR_FILTRO: Record<FiltroEstadoPrestamo, EstadoPrestamo[]> = {
  activos: ["activo", "en_mora"],
  finalizados: ["pagado", "cancelado"],
};

export interface CrearPrestamoInput {
  clienteId: string;
  monto: number;
  tasaPorcentaje: number;
  periodo: Periodo;
  numeroCuotas: number;
  fechaDesembolso: Date;
  creadoPorId: string;
}

export async function crearPrestamo(input: CrearPrestamoInput) {
  const tabla = generarTablaAmortizacion({
    monto: input.monto,
    tasaPorcentaje: input.tasaPorcentaje,
    periodo: input.periodo,
    numeroCuotas: input.numeroCuotas,
    fechaDesembolso: input.fechaDesembolso,
  });

  return prisma.prestamo.create({
    data: {
      clienteId: input.clienteId,
      monto: input.monto,
      tasaPorcentaje: input.tasaPorcentaje,
      periodo: input.periodo,
      numeroCuotas: input.numeroCuotas,
      valorCuota: tabla.valorCuota.toNumber(),
      fechaDesembolso: input.fechaDesembolso,
      creadoPorId: input.creadoPorId,
      cuotas: {
        create: tabla.cuotas.map((cuota) => ({
          numero: cuota.numero,
          fechaVencimiento: cuota.fechaVencimiento,
          valorCuota: cuota.valorCuota.toNumber(),
          interes: cuota.interes.toNumber(),
          capital: cuota.capital.toNumber(),
          saldoRestante: cuota.saldoRestante.toNumber(),
        })),
      },
    },
    include: { cliente: true, cuotas: { orderBy: { numero: "asc" } } },
  });
}

export async function listarPrestamos(filtro: FiltroEstadoPrestamo = "activos") {
  const prestamos = await prisma.prestamo.findMany({
    where: { estado: { in: ESTADOS_POR_FILTRO[filtro] } },
    include: { cliente: true, cuotas: true },
    orderBy: { creadoEn: "desc" },
  });

  return prestamos.map((prestamo) => ({
    ...prestamo,
    saldoPendiente: saldoPendientePrestamo(prestamo.cuotas),
  }));
}

/** Marca el préstamo como cancelado. No modifica cuotas ni pagos existentes. */
export async function anularPrestamo(id: string) {
  return prisma.prestamo.update({
    where: { id },
    data: { estado: "cancelado" },
  });
}

export async function obtenerPrestamo(id: string) {
  return prisma.prestamo.findUnique({
    where: { id },
    include: {
      cliente: true,
      cuotas: { orderBy: { numero: "asc" } },
      pagos: {
        orderBy: { fecha: "desc" },
        include: { aplicaciones: { include: { cuota: true } }, registradoPor: true },
      },
    },
  });
}
