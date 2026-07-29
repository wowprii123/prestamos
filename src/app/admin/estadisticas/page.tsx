import { obtenerResumenEstadisticas } from "@/lib/servicios/estadisticas";
import type { Decimal } from "@/lib/dinero";
import { Card } from "@/components/ui/card";
import { formatearMoneda } from "@/lib/formato";
import { inicioDeMesUTC } from "@/lib/periodo-fechas";
import { finDeDiaUTC } from "@/lib/fecha-utc";

function aFechaInput(fecha: Date): string {
  return fecha.toISOString().slice(0, 10);
}

export default async function EstadisticasPage({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; hasta?: string }>;
}) {
  const params = await searchParams;
  const hoy = new Date();

  const desde = params.desde ? new Date(params.desde) : inicioDeMesUTC(hoy);
  const hastaSeleccionada = params.hasta ? new Date(params.hasta) : hoy;
  const hasta = finDeDiaUTC(hastaSeleccionada);

  const resumen = await obtenerResumenEstadisticas({ desde, hasta });

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-slate-900">Estadísticas</h1>

      <Card>
        <form method="get" className="flex flex-wrap items-end gap-4">
          <div>
            <label htmlFor="desde" className="block text-sm font-medium text-slate-700">
              Desde
            </label>
            <input
              id="desde"
              name="desde"
              type="date"
              defaultValue={aFechaInput(desde)}
              className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
          <div>
            <label htmlFor="hasta" className="block text-sm font-medium text-slate-700">
              Hasta
            </label>
            <input
              id="hasta"
              name="hasta"
              type="date"
              defaultValue={aFechaInput(hastaSeleccionada)}
              className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Aplicar rango
          </button>
        </form>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricaCard etiqueta="Total prestado" valor={resumen.totalPrestado} />
        <MetricaCard etiqueta="Total recuperado" valor={resumen.totalRecuperado} />
        <MetricaCard etiqueta="Total intereses" valor={resumen.totalIntereses} />
      </div>

      <Card>
        <p className="text-xs uppercase tracking-wide text-slate-500">
          Saldo total de préstamos activos y en mora (a hoy, no depende del rango)
        </p>
        <p className="mt-1 text-2xl font-semibold text-slate-900">
          {formatearMoneda(resumen.saldoTotalPendiente)}
        </p>
      </Card>
    </div>
  );
}

function MetricaCard({ etiqueta, valor }: { etiqueta: string; valor: Decimal }) {
  return (
    <Card>
      <p className="text-xs uppercase tracking-wide text-slate-500">{etiqueta}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{formatearMoneda(valor)}</p>
    </Card>
  );
}
