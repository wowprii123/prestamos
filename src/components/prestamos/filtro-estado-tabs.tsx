import Link from "next/link";
import type { FiltroEstadoPrestamo } from "@/lib/servicios/prestamos";

const OPCIONES: { valor: FiltroEstadoPrestamo; label: string }[] = [
  { valor: "activos", label: "Activos" },
  { valor: "finalizados", label: "Finalizados" },
];

export function FiltroEstadoTabs({
  basePath,
  filtroActivo,
}: {
  basePath: string;
  filtroActivo: FiltroEstadoPrestamo;
}) {
  return (
    <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
      {OPCIONES.map((opcion) => (
        <Link
          key={opcion.valor}
          href={`${basePath}?estado=${opcion.valor}`}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
            filtroActivo === opcion.valor
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          {opcion.label}
        </Link>
      ))}
    </div>
  );
}
