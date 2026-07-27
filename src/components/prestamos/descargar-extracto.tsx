"use client";

import { useState } from "react";

export function DescargarExtracto({ prestamoId }: { prestamoId: string }) {
  const [mes, setMes] = useState(() => new Date().toISOString().slice(0, 7));

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div>
        <label htmlFor="mes-extracto" className="block text-sm font-medium text-slate-700">
          Mes
        </label>
        <input
          id="mes-extracto"
          type="month"
          value={mes}
          onChange={(evento) => setMes(evento.target.value)}
          className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
      </div>
      <a
        href={`/api/extractos/${prestamoId}?tipo=mensual&mes=${mes}`}
        className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        Descargar extracto mensual
      </a>
      <a
        href={`/api/extractos/${prestamoId}?tipo=acumulado`}
        className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
      >
        Descargar extracto acumulado
      </a>
    </div>
  );
}
