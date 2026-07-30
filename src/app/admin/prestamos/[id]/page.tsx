import { notFound } from "next/navigation";
import { obtenerPrestamo } from "@/lib/servicios/prestamos";
import { montoRecomendado as calcularMontoRecomendado } from "@/lib/pagos";
import { Card } from "@/components/ui/card";
import { TablaAmortizacion } from "@/components/prestamos/tabla-amortizacion";
import { ResumenPrestamo } from "@/components/prestamos/resumen-prestamo";
import { HistorialPagos } from "@/components/prestamos/historial-pagos";
import { DescargarExtracto } from "@/components/prestamos/descargar-extracto";
import { formatearMoneda } from "@/lib/formato";
import { RegistrarPago } from "./registrar-pago";
import { EnviarExtracto } from "./enviar-extracto";
import { AnularPrestamo } from "./anular-prestamo";

export default async function DetallePrestamoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const prestamo = await obtenerPrestamo(id);
  if (!prestamo) notFound();

  const recomendado = calcularMontoRecomendado(
    prestamo.cuotas.map((cuota) => ({
      id: cuota.id,
      numero: cuota.numero,
      valorCuota: cuota.valorCuota.toString(),
      montoPagado: cuota.montoPagado.toString(),
    })),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">
          Préstamo de {prestamo.cliente.nombre}
        </h1>
        <p className="text-sm text-slate-500">{prestamo.cliente.direccion}</p>
      </div>

      <ResumenPrestamo prestamo={prestamo} />

      <Card>
        <h2 className="mb-4 text-sm font-semibold text-slate-900">Registrar pago</h2>
        {prestamo.estado === "cancelado" ? (
          <p className="text-sm text-slate-500">Este préstamo fue anulado.</p>
        ) : (
          <RegistrarPago
            prestamoId={prestamo.id}
            montoRecomendado={recomendado ? formatearMoneda(recomendado.toString()) : null}
          />
        )}
      </Card>

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

      <Card className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-900">Extractos</h2>
        <DescargarExtracto prestamoId={prestamo.id} />
        <EnviarExtracto prestamoId={prestamo.id} />
      </Card>

      {(prestamo.estado === "activo" || prestamo.estado === "en_mora") && (
        <Card>
          <h2 className="mb-1 text-sm font-semibold text-slate-900">Zona de riesgo</h2>
          <AnularPrestamo prestamoId={prestamo.id} />
        </Card>
      )}
    </div>
  );
}
