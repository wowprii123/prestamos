import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { obtenerDatosExtracto, registrarExtracto } from "@/lib/servicios/extractos";
import { generarExtractoPdf } from "@/lib/pdf/generar-extracto-pdf";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ prestamoId: string }> },
) {
  const session = await auth();
  if (!session) return new Response("No autorizado", { status: 401 });

  const { prestamoId } = await params;
  const prestamo = await prisma.prestamo.findUnique({
    where: { id: prestamoId },
    select: { id: true },
  });
  if (!prestamo) return new Response("Préstamo no encontrado", { status: 404 });

  const tipo = request.nextUrl.searchParams.get("tipo") === "acumulado" ? "acumulado" : "mensual";
  const mesParam = request.nextUrl.searchParams.get("mes");
  const fechaReferencia = mesParam ? new Date(`${mesParam}-01T00:00:00.000Z`) : new Date();

  const datos = await obtenerDatosExtracto(prestamoId, tipo, fechaReferencia);
  const pdfBuffer = await generarExtractoPdf(datos);
  await registrarExtracto(datos);

  const nombreArchivo = `extracto-${tipo}-${datos.prestamo.cliente.nombre.replace(/\s+/g, "-")}.pdf`;

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${nombreArchivo}"`,
    },
  });
}
