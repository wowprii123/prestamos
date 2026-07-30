import { prisma } from "@/lib/db";
import { Decimal } from "@/lib/dinero";
import { inicioDeMesUTC, finDeMesUTC } from "@/lib/periodo-fechas";
import { formatearFecha, formatearMoneda } from "@/lib/formato";
import { enviarCorreoZeptoMail, type RespuestaZeptoMail } from "@/lib/zeptomail";
import { generarExtractoPdf } from "@/lib/pdf/generar-extracto-pdf";
import type { Prisma } from "@/generated/prisma/client";
import type { TipoExtracto } from "@/generated/prisma/enums";

export async function obtenerDatosExtracto(
  prestamoId: string,
  tipo: TipoExtracto,
  fechaReferencia: Date = new Date(),
) {
  const prestamo = await prisma.prestamo.findUnique({
    where: { id: prestamoId },
    include: {
      cliente: true,
      cuotas: { orderBy: { numero: "asc" } },
      pagos: {
        orderBy: { fecha: "asc" },
        include: { aplicaciones: { include: { cuota: true } }, registradoPor: true },
      },
    },
  });

  if (!prestamo) throw new Error("Préstamo no encontrado");

  const periodoInicio = tipo === "mensual" ? inicioDeMesUTC(fechaReferencia) : prestamo.fechaDesembolso;
  const periodoFin = tipo === "mensual" ? finDeMesUTC(fechaReferencia) : new Date();

  const cuotas =
    tipo === "mensual"
      ? prestamo.cuotas.filter(
          (cuota) => cuota.fechaVencimiento >= periodoInicio && cuota.fechaVencimiento <= periodoFin,
        )
      : prestamo.cuotas;

  const pagos =
    tipo === "mensual"
      ? prestamo.pagos.filter((pago) => pago.fecha >= periodoInicio && pago.fecha <= periodoFin)
      : prestamo.pagos;

  const saldoPendiente = prestamo.cuotas.reduce(
    (acc, cuota) => acc.plus(new Decimal(cuota.valorCuota).minus(cuota.montoPagado)),
    new Decimal(0),
  );

  return {
    tipo,
    periodoInicio,
    periodoFin,
    prestamo,
    cuotas,
    pagos,
    saldoPendiente,
  };
}

export type DatosExtracto = Awaited<ReturnType<typeof obtenerDatosExtracto>>;

export async function registrarExtracto(datos: DatosExtracto) {
  return prisma.extracto.create({
    data: {
      prestamoId: datos.prestamo.id,
      tipo: datos.tipo,
      periodoInicio: datos.periodoInicio,
      periodoFin: datos.periodoFin,
    },
  });
}

function construirCorreoExtracto(datos: DatosExtracto) {
  const nombreTipo = datos.tipo === "mensual" ? "mensual" : "acumulado";
  const asunto = `Extracto ${nombreTipo} de tu préstamo`;
  const htmlBody = `
    <p>Hola ${datos.prestamo.cliente.nombre},</p>
    <p>Adjunto encontrarás tu extracto ${nombreTipo} correspondiente al período
    ${formatearFecha(datos.periodoInicio)} – ${formatearFecha(datos.periodoFin)}.</p>
    <p>Saldo pendiente actual: <strong>${formatearMoneda(datos.saldoPendiente)}</strong>.</p>
  `.trim();

  return { asunto, htmlBody };
}

/**
 * Genera el PDF, lo envía por ZeptoMail y registra el resultado (éxito o
 * fallo) en `extractos` y `correos_enviados` para poder auditar envíos.
 *
 * El cliente no tiene correo propio (ver Cliente en el schema), así que el
 * destino se escribe a mano cada vez que se envía un extracto.
 */
export async function enviarExtractoPorCorreo(
  prestamoId: string,
  tipo: TipoExtracto,
  correoDestino: string,
  fechaReferencia: Date = new Date(),
) {
  const datos = await obtenerDatosExtracto(prestamoId, tipo, fechaReferencia);
  const pdfBuffer = await generarExtractoPdf(datos);
  const extracto = await registrarExtracto(datos);
  const { asunto, htmlBody } = construirCorreoExtracto(datos);

  try {
    const respuesta = await enviarCorreoZeptoMail({
      destinatario: {
        email: correoDestino,
        nombre: datos.prestamo.cliente.nombre,
      },
      asunto,
      htmlBody,
      adjunto: {
        nombreArchivo: `extracto-${tipo}.pdf`,
        contenido: pdfBuffer,
        mimeType: "application/pdf",
      },
    });

    await registrarResultadoEnvio(extracto.id, correoDestino, "enviado", respuesta);
  } catch (error) {
    const detalleError = { error: error instanceof Error ? error.message : String(error) };
    await registrarResultadoEnvio(extracto.id, correoDestino, "fallido", detalleError);
    throw error;
  }

  return extracto;
}

async function registrarResultadoEnvio(
  extractoId: string,
  destinatario: string,
  estado: "enviado" | "fallido",
  respuestaApi: RespuestaZeptoMail,
) {
  await prisma.$transaction([
    prisma.extracto.update({
      where: { id: extractoId },
      data:
        estado === "enviado"
          ? { estadoEnvio: "enviado", enviadoEn: new Date() }
          : { estadoEnvio: "fallido", intentosEnvio: { increment: 1 } },
    }),
    prisma.correoEnviado.create({
      data: {
        extractoId,
        destinatario,
        proveedor: "zeptomail",
        respuestaApi: respuestaApi as Prisma.InputJsonValue,
        estado,
      },
    }),
  ]);
}
