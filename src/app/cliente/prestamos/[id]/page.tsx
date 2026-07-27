import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { obtenerPrestamo } from "@/lib/servicios/prestamos";
import { Card } from "@/components/ui/card";
import { TablaAmortizacion } from "@/components/prestamos/tabla-amortizacion";
import { ResumenPrestamo } from "@/components/prestamos/resumen-prestamo";
import { HistorialPagos } from "@/components/prestamos/historial-pagos";
import { DescargarExtracto } from "@/components/prestamos/descargar-extracto";

export default async function DetallePrestamoClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const prestamo = await obtenerPrestamo(id);

  if (!prestamo || prestamo.clienteId !== session?.user.id) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-slate-900">Detalle del préstamo</h1>

      <ResumenPrestamo prestamo={prestamo} />

      <Card>
        <h2 className="mb-4 text-sm font-semibold text-slate-900">
          Tabla de amortización
        </h2>
        <TablaAmortizacion cuotas={prestamo.cuotas} />
      </Card>

      <Card>
        <h2 className="mb-4 text-sm font-semibold text-slate-900">
          Historial de pagos
        </h2>
        <HistorialPagos pagos={prestamo.pagos} />
      </Card>

      <Card>
        <h2 className="mb-4 text-sm font-semibold text-slate-900">Extractos</h2>
        <DescargarExtracto prestamoId={prestamo.id} />
      </Card>
    </div>
  );
}
