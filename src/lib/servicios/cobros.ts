import { prisma } from "@/lib/db";
import { Decimal } from "@/lib/dinero";
import { addDiasUTC, diferenciaEnDias, inicioDeDiaUTC } from "@/lib/fecha-utc";

export interface CuotaPorCobrar {
  cuotaId: string;
  prestamoId: string;
  numero: number;
  fechaVencimiento: Date;
  saldoPendiente: Decimal;
  diasParaVencer: number;
  cliente: { nombre: string; email: string };
}

export interface ResumenCobros {
  vencidas: CuotaPorCobrar[];
  porVencer: CuotaPorCobrar[];
}

/**
 * Cuotas pendientes o parciales cuyo vencimiento ya pasó, o vence dentro de
 * `diasHaciaAdelante` días. El estado "vencida" se calcula comparando la
 * fecha con hoy en el momento de la consulta (no depende de que algo
 * actualice `cuota.estado` en segundo plano).
 */
export async function obtenerResumenCobros(diasHaciaAdelante = 10): Promise<ResumenCobros> {
  const hoy = inicioDeDiaUTC(new Date());
  const limite = addDiasUTC(hoy, diasHaciaAdelante);

  const cuotas = await prisma.cuota.findMany({
    where: {
      estado: { in: ["pendiente", "parcial"] },
      fechaVencimiento: { lte: limite },
    },
    include: { prestamo: { include: { cliente: true } } },
    orderBy: { fechaVencimiento: "asc" },
  });

  const cuotasPorCobrar: CuotaPorCobrar[] = cuotas.map((cuota) => ({
    cuotaId: cuota.id,
    prestamoId: cuota.prestamoId,
    numero: cuota.numero,
    fechaVencimiento: cuota.fechaVencimiento,
    saldoPendiente: new Decimal(cuota.valorCuota).minus(cuota.montoPagado),
    diasParaVencer: diferenciaEnDias(cuota.fechaVencimiento, hoy),
    cliente: { nombre: cuota.prestamo.cliente.nombre, email: cuota.prestamo.cliente.email },
  }));

  return {
    vencidas: cuotasPorCobrar.filter((cuota) => cuota.diasParaVencer < 0),
    porVencer: cuotasPorCobrar.filter((cuota) => cuota.diasParaVencer >= 0),
  };
}
