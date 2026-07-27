import { formatearFecha, formatearMoneda } from "@/lib/formato";

export interface FilaPago {
  id: string;
  fecha: Date;
  monto: { toString(): string };
  tipo: string;
  registradoPor: { nombre: string };
  aplicaciones: {
    montoAplicado: { toString(): string };
    cuota: { numero: number };
  }[];
}

export function HistorialPagos({ pagos }: { pagos: FilaPago[] }) {
  if (pagos.length === 0) {
    return <p className="text-sm text-slate-500">Todavía no se han registrado pagos.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
            <th className="py-2 pr-4">Fecha</th>
            <th className="py-2 pr-4 text-right">Monto</th>
            <th className="py-2 pr-4">Tipo</th>
            <th className="py-2 pr-4">Aplicado a</th>
            <th className="py-2 pr-4">Registrado por</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {pagos.map((pago) => (
            <tr key={pago.id}>
              <td className="py-2 pr-4 text-slate-700">{formatearFecha(pago.fecha)}</td>
              <td className="py-2 pr-4 text-right font-medium text-slate-900">
                {formatearMoneda(pago.monto.toString())}
              </td>
              <td className="py-2 pr-4 text-slate-500">
                {pago.tipo === "recomendado" ? "Recomendado" : "Libre"}
              </td>
              <td className="py-2 pr-4 text-slate-500">
                {pago.aplicaciones
                  .map(
                    (aplicacion) =>
                      `Cuota #${aplicacion.cuota.numero} (${formatearMoneda(
                        aplicacion.montoAplicado.toString(),
                      )})`,
                  )
                  .join(", ")}
              </td>
              <td className="py-2 pr-4 text-slate-500">{pago.registradoPor.nombre}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
