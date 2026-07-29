import Link from "next/link";
import { auth } from "@/auth";
import { listarPrestamosDeCliente } from "@/lib/servicios/prestamos";
import { Badge } from "@/components/ui/badge";
import { FilaPrestamo } from "@/components/prestamos/fila-prestamo";
import {
  formatearEstadoPrestamo,
  formatearFecha,
  formatearMoneda,
  formatearPeriodo,
} from "@/lib/formato";

export default async function ClientePage() {
  const session = await auth();
  const prestamos = await listarPrestamosDeCliente(session!.user.id);

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-slate-900">Mis préstamos</h1>

      {prestamos.length === 0 ? (
        <p className="text-sm text-slate-500">Todavía no tienes préstamos registrados.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
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
                  <FilaPrestamo key={prestamo.id} href={`/cliente/prestamos/${prestamo.id}`}>
                    <td className="px-4 py-3">
                      <Link
                        href={`/cliente/prestamos/${prestamo.id}`}
                        className="font-medium text-slate-900 hover:underline"
                      >
                        {formatearMoneda(prestamo.monto.toString())}
                      </Link>
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
        </div>
      )}
    </div>
  );
}
