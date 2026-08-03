"use client";

import { useActionState } from "react";
import { actualizarFechasAction } from "./actions";
import { formatearMoneda } from "@/lib/formato";

export interface CuotaFechaPlano {
  id: string;
  numero: number;
  valorCuota: string;
  fechaVencimiento: string;
}

export function ReconfigurarFechasForm({
  prestamoId,
  cuotas,
}: {
  prestamoId: string;
  cuotas: CuotaFechaPlano[];
}) {
  const [error, formAction, pendiente] = useActionState(actualizarFechasAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="prestamoId" value={prestamoId} />

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="py-2 pr-4">#</th>
              <th className="py-2 pr-4">Cuota</th>
              <th className="py-2 pr-4">Vencimiento</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cuotas.map((cuota) => (
              <tr key={cuota.id}>
                <td className="py-2 pr-4 text-slate-500">{cuota.numero}</td>
                <td className="py-2 pr-4 text-slate-700">{formatearMoneda(cuota.valorCuota)}</td>
                <td className="py-2 pr-4">
                  <input
                    type="date"
                    name={`fecha_${cuota.id}`}
                    defaultValue={cuota.fechaVencimiento}
                    required
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={pendiente}
        className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
      >
        {pendiente ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}
