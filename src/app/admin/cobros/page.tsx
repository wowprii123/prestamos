import { obtenerResumenCobros, type CuotaPorCobrar } from "@/lib/servicios/cobros";
import { Card } from "@/components/ui/card";
import { FilaPrestamo } from "@/components/prestamos/fila-prestamo";
import { formatearFecha, formatearMoneda } from "@/lib/formato";

export default async function AdminCobrosPage() {
  const { vencidas, porVencer } = await obtenerResumenCobros(10);

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-slate-900">Cobros</h1>

      <Card>
        <h2 className="mb-4 text-sm font-semibold text-red-700">
          Vencidas ({vencidas.length})
        </h2>
        <TablaCuotasPorCobrar
          cuotas={vencidas}
          vacio="No hay cuotas vencidas."
          columnaExtra="atraso"
        />
      </Card>

      <Card>
        <h2 className="mb-4 text-sm font-semibold text-slate-900">
          Por vencer en los próximos 10 días ({porVencer.length})
        </h2>
        <TablaCuotasPorCobrar
          cuotas={porVencer}
          vacio="No hay cuotas por vencer en los próximos 10 días."
          columnaExtra="restante"
        />
      </Card>
    </div>
  );
}

function TablaCuotasPorCobrar({
  cuotas,
  vacio,
  columnaExtra,
}: {
  cuotas: CuotaPorCobrar[];
  vacio: string;
  columnaExtra: "atraso" | "restante";
}) {
  if (cuotas.length === 0) {
    return <p className="text-sm text-slate-500">{vacio}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
            <th className="py-2 pr-4">Cliente</th>
            <th className="py-2 pr-4">Cuota</th>
            <th className="py-2 pr-4">Vencimiento</th>
            <th className="py-2 pr-4 text-right">Saldo pendiente</th>
            <th className="py-2 pr-4">{columnaExtra === "atraso" ? "Atraso" : "Vence en"}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {cuotas.map((cuota) => (
            <FilaPrestamo key={cuota.cuotaId} href={`/admin/prestamos/${cuota.prestamoId}`}>
              <td className="py-2 pr-4 font-medium text-slate-900">{cuota.cliente.nombre}</td>
              <td className="py-2 pr-4 text-slate-700">#{cuota.numero}</td>
              <td className="py-2 pr-4 text-slate-700">
                {formatearFecha(cuota.fechaVencimiento)}
              </td>
              <td className="py-2 pr-4 text-right font-medium text-slate-900">
                {formatearMoneda(cuota.saldoPendiente)}
              </td>
              <td className="py-2 pr-4">
                {columnaExtra === "atraso" ? (
                  <span className="font-medium text-red-600">
                    {Math.abs(cuota.diasParaVencer)}{" "}
                    {Math.abs(cuota.diasParaVencer) === 1 ? "día" : "días"}
                  </span>
                ) : cuota.diasParaVencer === 0 ? (
                  <span className="font-medium text-amber-600">Hoy</span>
                ) : (
                  <span className="text-slate-500">
                    {cuota.diasParaVencer} {cuota.diasParaVencer === 1 ? "día" : "días"}
                  </span>
                )}
              </td>
            </FilaPrestamo>
          ))}
        </tbody>
      </table>
    </div>
  );
}
