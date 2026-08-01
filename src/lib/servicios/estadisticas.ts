import { prisma } from "@/lib/db";
import { calcularResumenEstadisticas, type ResumenEstadisticas } from "@/lib/estadisticas";
import { ESTADOS_POR_FILTRO } from "@/lib/servicios/prestamos";

export interface RangoFechas {
  desde: Date;
  hasta: Date;
}

export async function obtenerResumenEstadisticas(rango: RangoFechas): Promise<ResumenEstadisticas> {
  const [prestamosEnRango, aplicacionesEnRango, cuotasAbiertas] = await Promise.all([
    prisma.prestamo.findMany({
      where: {
        fechaDesembolso: { gte: rango.desde, lte: rango.hasta },
        estado: { not: "cancelado" },
      },
      select: { monto: true },
    }),
    prisma.aplicacionPago.findMany({
      where: {
        pago: { fecha: { gte: rango.desde, lte: rango.hasta } },
        cuota: { prestamo: { estado: { not: "cancelado" } } },
      },
      select: {
        montoAplicado: true,
        cuota: { select: { interes: true, valorCuota: true } },
      },
    }),
    prisma.cuota.findMany({
      where: { prestamo: { estado: { in: ESTADOS_POR_FILTRO.activos } } },
      select: { valorCuota: true, montoPagado: true, interes: true },
    }),
  ]);

  return calcularResumenEstadisticas({
    montosPrestamos: prestamosEnRango.map((prestamo) => prestamo.monto.toString()),
    aplicaciones: aplicacionesEnRango.map((aplicacion) => ({
      montoAplicado: aplicacion.montoAplicado.toString(),
      cuotaInteres: aplicacion.cuota.interes.toString(),
      cuotaValorCuota: aplicacion.cuota.valorCuota.toString(),
    })),
    cuotasAbiertas: cuotasAbiertas.map((cuota) => ({
      valorCuota: cuota.valorCuota.toString(),
      montoPagado: cuota.montoPagado.toString(),
      interes: cuota.interes.toString(),
    })),
  });
}
