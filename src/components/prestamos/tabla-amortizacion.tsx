import { Badge } from "@/components/ui/badge";
import { formatearEstadoCuota, formatearFecha, formatearMoneda } from "@/lib/formato";

export interface FilaCuota {
  id: string;
  numero: number;
  fechaVencimiento: Date;
  valorCuota: { toString(): string };
  interes: { toString(): string };
  capital: { toString(): string };
  saldoRestante: { toString(): string };
  montoPagado: { toString(): string };
  estado: string;
}

export function TablaAmortizacion({ cuotas }: { cuotas: FilaCuota[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
            <th className="py-2 pr-4">#</th>
            <th className="py-2 pr-4">Vencimiento</th>
            <th className="py-2 pr-4 text-right">Cuota</th>
            <th className="py-2 pr-4 text-right">Interés</th>
            <th className="py-2 pr-4 text-right">Capital</th>
            <th className="py-2 pr-4 text-right">Saldo</th>
            <th className="py-2 pr-4 text-right">Pagado</th>
            <th className="py-2 pr-4">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {cuotas.map((cuota) => (
            <tr key={cuota.id}>
              <td className="py-2 pr-4 text-slate-500">{cuota.numero}</td>
              <td className="py-2 pr-4 text-slate-700">
                {formatearFecha(cuota.fechaVencimiento)}
              </td>
              <td className="py-2 pr-4 text-right font-medium text-slate-900">
                {formatearMoneda(cuota.valorCuota.toString())}
              </td>
              <td className="py-2 pr-4 text-right text-slate-500">
                {formatearMoneda(cuota.interes.toString())}
              </td>
              <td className="py-2 pr-4 text-right text-slate-500">
                {formatearMoneda(cuota.capital.toString())}
              </td>
              <td className="py-2 pr-4 text-right text-slate-500">
                {formatearMoneda(cuota.saldoRestante.toString())}
              </td>
              <td className="py-2 pr-4 text-right text-slate-500">
                {formatearMoneda(cuota.montoPagado.toString())}
              </td>
              <td className="py-2 pr-4">
                <Badge estado={cuota.estado} texto={formatearEstadoCuota(cuota.estado)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
