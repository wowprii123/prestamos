import Link from "next/link";
import { notFound } from "next/navigation";
import { obtenerCliente } from "@/lib/servicios/clientes";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FilaClickeable } from "@/components/ui/fila-clickeable";
import {
  formatearEstadoPrestamo,
  formatearFecha,
  formatearMoneda,
  formatearPeriodo,
} from "@/lib/formato";

export default async function DetalleClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cliente = await obtenerCliente(id);
  if (!cliente) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">{cliente.nombre}</h1>
        <Link
          href={`/admin/clientes/${cliente.id}/editar`}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Editar
        </Link>
      </div>

      <Card className="flex flex-col gap-6 sm:flex-row sm:items-start">
        {cliente.foto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cliente.foto}
            alt={cliente.nombre}
            className="h-70 w-70 shrink-0 rounded-xl object-cover"
          />
        ) : (
          <div className="flex h-40 w-40 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-400">
            Sin foto
          </div>
        )}

        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo etiqueta="Dirección" valor={cliente.direccion} />
          <Campo etiqueta="Teléfono" valor={cliente.telefono ?? "—"} />
          <Campo etiqueta="Registrado" valor={formatearFecha(cliente.creadoEn)} />
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-sm font-semibold text-slate-900">
          Préstamos ({cliente.prestamos.length})
        </h2>
        {cliente.prestamos.length === 0 ? (
          <p className="text-sm text-slate-500">Este cliente todavía no tiene préstamos.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-4">Monto</th>
                  <th className="py-2 pr-4">Tasa</th>
                  <th className="py-2 pr-4">Período</th>
                  <th className="py-2 pr-4 text-right">Saldo pendiente</th>
                  <th className="py-2 pr-4">Estado</th>
                  <th className="py-2 pr-4">Desembolso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cliente.prestamos.map((prestamo) => (
                  <FilaClickeable key={prestamo.id} href={`/admin/prestamos/${prestamo.id}`}>
                    <td className="py-2 pr-4 font-medium text-slate-900">
                      {formatearMoneda(prestamo.monto.toString())}
                    </td>
                    <td className="py-2 pr-4 text-slate-700">
                      {prestamo.tasaPorcentaje.toString()}%
                    </td>
                    <td className="py-2 pr-4 text-slate-700">
                      {formatearPeriodo(prestamo.periodo)}
                    </td>
                    <td className="py-2 pr-4 text-right font-medium text-slate-900">
                      {formatearMoneda(prestamo.saldoPendiente)}
                    </td>
                    <td className="py-2 pr-4">
                      <Badge
                        estado={prestamo.estado}
                        texto={formatearEstadoPrestamo(prestamo.estado)}
                      />
                    </td>
                    <td className="py-2 pr-4 text-slate-500">
                      {formatearFecha(prestamo.fechaDesembolso)}
                    </td>
                  </FilaClickeable>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function Campo({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500">{etiqueta}</p>
      <p className="mt-1 text-sm font-medium text-slate-900">{valor}</p>
    </div>
  );
}
