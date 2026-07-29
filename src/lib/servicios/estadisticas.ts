import { prisma } from "@/lib/db";
import { calcularResumenEstadisticas, type ResumenEstadisticas } from "@/lib/estadisticas";

export interface RangoFechas {
  desde: Date;
  hasta: Date;
}

export async function obtenerResumenEstadisticas(rango: RangoFechas): Promise<ResumenEstadisticas> {
  const [prestamosEnRango, aplicacionesEnRango, cuotasActivas] = await Promise.all([
    prisma.prestamo.findMany({
      where: { fechaDesembolso: { gte: rango.desde, lte: rango.hasta } },
      select: { monto: true },
    }),
    prisma.aplicacionPago.findMany({
      where: { pago: { fecha: { gte: rango.desde, lte: rango.hasta } } },
      select: {
        montoAplicado: true,
        cuota: { select: { interes: true, valorCuota: true } },
      },
    }),
    prisma.cuota.findMany({
      where: { prestamo: { estado: { in: ["activo", "en_mora"] } } },
      select: { valorCuota: true, montoPagado: true },
    }),
  ]);

  return calcularResumenEstadisticas({
    montosPrestamos: prestamosEnRango.map((prestamo) => prestamo.monto.toString()),
    aplicaciones: aplicacionesEnRango.map((aplicacion) => ({
      montoAplicado: aplicacion.montoAplicado.toString(),
      cuotaInteres: aplicacion.cuota.interes.toString(),
      cuotaValorCuota: aplicacion.cuota.valorCuota.toString(),
    })),
    cuotasActivas: cuotasActivas.map((cuota) => ({
      valorCuota: cuota.valorCuota.toString(),
      montoPagado: cuota.montoPagado.toString(),
    })),
  });
}
