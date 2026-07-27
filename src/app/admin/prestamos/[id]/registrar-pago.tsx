"use client";

import { useActionState, useTransition } from "react";
import { registrarPagoLibreAction, registrarPagoRecomendadoAction } from "./pagos-actions";

interface RegistrarPagoProps {
  prestamoId: string;
  montoRecomendado: string | null;
}

export function RegistrarPago({ prestamoId, montoRecomendado }: RegistrarPagoProps) {
  const [errorLibre, formActionLibre, pendienteLibre] = useActionState(
    registrarPagoLibreAction,
    undefined,
  );
  const [pendienteRecomendado, startTransition] = useTransition();

  if (!montoRecomendado) {
    return <p className="text-sm text-slate-500">Este préstamo ya está saldado.</p>;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div>
        <h3 className="text-sm font-medium text-slate-700">Pago recomendado</h3>
        <p className="mt-1 text-xs text-slate-500">
          Cubre la cuota pendiente más antigua ({montoRecomendado}).
        </p>
        <button
          type="button"
          disabled={pendienteRecomendado}
          onClick={() =>
            startTransition(() => {
              registrarPagoRecomendadoAction(prestamoId);
            })
          }
          className="mt-3 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
        >
          {pendienteRecomendado ? "Registrando…" : "Registrar pago recomendado"}
        </button>
      </div>

      <div>
        <h3 className="text-sm font-medium text-slate-700">Pago libre / abono</h3>
        <p className="mt-1 text-xs text-slate-500">
          Cualquier monto: se reparte entre cuotas o queda como abono parcial.
        </p>
        <form action={formActionLibre} className="mt-3 space-y-2">
          <input type="hidden" name="prestamoId" value={prestamoId} />
          <input
            name="monto"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Monto"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
          <input
            name="medioPago"
            placeholder="Medio de pago (opcional)"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
          {errorLibre && <p className="text-sm text-red-600">{errorLibre}</p>}
          <button
            type="submit"
            disabled={pendienteLibre}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            {pendienteLibre ? "Registrando…" : "Registrar pago"}
          </button>
        </form>
      </div>
    </div>
  );
}
