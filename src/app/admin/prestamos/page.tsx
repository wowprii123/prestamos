import Link from "next/link";
import { listarPrestamos, type FiltroEstadoPrestamo } from "@/lib/servicios/prestamos";
import { Badge } from "@/components/ui/badge";
import { FilaPrestamo } from "@/components/prestamos/fila-prestamo";
import { FiltroEstadoTabs } from "@/components/prestamos/filtro-estado-tabs";
import {
  formatearEstadoPrestamo,
  formatearFecha,
  formatearMoneda,
  formatearPeriodo,
} from "@/lib/formato";

export default async function AdminPrestamosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const filtro: FiltroEstadoPrestamo = estado === "finalizados" ? "finalizados" : "activos";
  const prestamos = await listarPrestamos(filtro);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">Préstamos</h1>
        <Link
          href="/admin/prestamos/nuevo"
          className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          Nuevo préstamo
        </Link>
      </div>

      <FiltroEstadoTabs basePath="/admin/prestamos" filtroActivo={filtro} />

      {prestamos.length === 0 ? (
        <p className="text-sm text-slate-500">
          {filtro === "activos"
            ? "No hay préstamos activos ni en mora."
            : "No hay préstamos pagados ni cancelados."}
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Monto</th>
                <th className="px-4 py-3">Tasa mensual</th>
                <th className="px-4 py-3">Período</th>
                <th className="px-4 py-3">Cuotas</th>
                <th className="px-4 py-3 text-right">Saldo pendiente</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Desembolso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {prestamos.map((prestamo) => (
                <FilaPrestamo key={prestamo.id} href={`/admin/prestamos/${prestamo.id}`}>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/prestamos/${prestamo.id}`}
                      className="font-medium text-slate-900 hover:underline"
                    >
                      {prestamo.cliente.nombre}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {formatearMoneda(prestamo.monto.toString())}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {prestamo.tasaMensual.toString()}%
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {formatearPeriodo(prestamo.periodo)}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{prestamo.numeroCuotas}</td>
                  <td className="px-4 py-3 text-right font-medium text-slate-900">
                    {formatearMoneda(prestamo.saldoPendiente)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      estado={prestamo.estado}
                      texto={formatearEstadoPrestamo(prestamo.estado)}
                    />
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {formatearFecha(prestamo.fechaDesembolso)}
                  </td>
                </FilaPrestamo>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
