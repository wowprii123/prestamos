"use client";

import { useActionState, useState } from "react";
import { enviarExtractoAction, type ResultadoEnvioExtracto } from "./extractos-actions";

export function EnviarExtracto({ prestamoId }: { prestamoId: string }) {
  const [resultado, formAction, pendiente] = useActionState<
    ResultadoEnvioExtracto | undefined,
    FormData
  >(enviarExtractoAction, undefined);
  const [mes, setMes] = useState(() => new Date().toISOString().slice(0, 7));
  const [correoDestino, setCorreoDestino] = useState("");

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor="correo-destino" className="block text-sm font-medium text-slate-700">
            Correo destino
          </label>
          <input
            id="correo-destino"
            type="email"
            required
            placeholder="correo@ejemplo.com"
            value={correoDestino}
            onChange={(evento) => setCorreoDestino(evento.target.value)}
            className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>

        <div>
          <label htmlFor="mes-envio" className="block text-sm font-medium text-slate-700">
            Mes (para el extracto mensual)
          </label>
          <input
            id="mes-envio"
            type="month"
            value={mes}
            onChange={(evento) => setMes(evento.target.value)}
            className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>

        <form action={formAction}>
          <input type="hidden" name="prestamoId" value={prestamoId} />
          <input type="hidden" name="tipo" value="mensual" />
          <input type="hidden" name="mes" value={mes} />
          <input type="hidden" name="correoDestino" value={correoDestino} />
          <button
            type="submit"
            disabled={pendiente}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Enviar mensual por correo
          </button>
        </form>

        <form action={formAction}>
          <input type="hidden" name="prestamoId" value={prestamoId} />
          <input type="hidden" name="tipo" value="acumulado" />
          <input type="hidden" name="correoDestino" value={correoDestino} />
          <button
            type="submit"
            disabled={pendiente}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
          >
            Enviar acumulado por correo
          </button>
        </form>
      </div>

      {resultado && (
        <p className={`text-sm ${resultado.ok ? "text-green-600" : "text-red-600"}`}>
          {resultado.mensaje}
        </p>
      )}
    </div>
  );
}
