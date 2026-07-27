import { prisma } from "@/lib/db";
import { Decimal } from "@/lib/dinero";
import { aplicarPago, montoRecomendado, type CuotaPendiente } from "@/lib/pagos";
import type { TipoPago } from "@/generated/prisma/enums";

export interface RegistrarPagoInput {
  prestamoId: string;
  tipo: TipoPago;
  /** Requerido cuando tipo === "libre". Se ignora (se calcula) si es "recomendado". */
  monto?: number;
  medioPago?: string;
  nota?: string;
  registradoPorId: string;
}

/**
 * Registra un pago y lo reparte entre las cuotas pendientes del préstamo.
 * Todo ocurre en una transacción: si algo falla, no queda un pago huérfano
 * ni cuotas a medio actualizar.
 */
export async function registrarPago(input: RegistrarPagoInput) {
  return prisma.$transaction(async (tx) => {
    const cuotas = await tx.cuota.findMany({
      where: { prestamoId: input.prestamoId },
      orderBy: { numero: "asc" },
    });

    const cuotasPendientes: CuotaPendiente[] = cuotas.map((cuota) => ({
      id: cuota.id,
      numero: cuota.numero,
      valorCuota: cuota.valorCuota,
      montoPagado: cuota.montoPagado,
    }));

    let monto: Decimal;
    if (input.tipo === "recomendado") {
      const recomendado = montoRecomendado(cuotasPendientes);
      if (!recomendado) throw new Error("Este préstamo no tiene cuotas pendientes");
      monto = recomendado;
    } else {
      if (!input.monto || input.monto <= 0) {
        throw new Error("El monto del pago debe ser mayor a cero");
      }
      monto = new Decimal(input.monto);
    }

    const { aplicaciones, sobrante } = aplicarPago(cuotasPendientes, monto);

    if (aplicaciones.length === 0) {
      throw new Error("Este préstamo no tiene cuotas pendientes");
    }
    if (sobrante.gt(0)) {
      throw new Error(
        `El monto excede el saldo pendiente del préstamo por ${sobrante.toFixed(2)}`,
      );
    }

    const pago = await tx.pago.create({
      data: {
        prestamoId: input.prestamoId,
        monto: monto.toNumber(),
        tipo: input.tipo,
        medioPago: input.medioPago,
        nota: input.nota,
        registradoPorId: input.registradoPorId,
        aplicaciones: {
          create: aplicaciones.map((aplicacion) => ({
            cuotaId: aplicacion.cuotaId,
            montoAplicado: aplicacion.montoAplicado.toNumber(),
          })),
        },
      },
      include: { aplicaciones: true },
    });

    for (const aplicacion of aplicaciones) {
      await tx.cuota.update({
        where: { id: aplicacion.cuotaId },
        data: {
          montoPagado: aplicacion.nuevoMontoPagado.toNumber(),
          estado: aplicacion.nuevoEstado,
        },
      });
    }

    const cuotasActualizadas = await tx.cuota.findMany({
      where: { prestamoId: input.prestamoId },
    });
    const prestamoSaldado = cuotasActualizadas.every((cuota) => cuota.estado === "pagada");
    if (prestamoSaldado) {
      await tx.prestamo.update({
        where: { id: input.prestamoId },
        data: { estado: "pagado" },
      });
    }

    return pago;
  });
}
