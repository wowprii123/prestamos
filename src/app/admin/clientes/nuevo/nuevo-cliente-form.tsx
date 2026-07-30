"use client";

import { useActionState } from "react";
import { crearClienteAction } from "../actions";

export function NuevoClienteForm() {
  const [error, formAction, pendiente] = useActionState(crearClienteAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-slate-700">
          Nombre completo
        </label>
        <input
          id="nombre"
          name="nombre"
          required
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
      </div>

      <div>
        <label htmlFor="direccion" className="block text-sm font-medium text-slate-700">
          Dirección
        </label>
        <textarea
          id="direccion"
          name="direccion"
          required
          rows={2}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
      </div>

      <div>
        <label htmlFor="telefono" className="block text-sm font-medium text-slate-700">
          Teléfono (opcional)
        </label>
        <input
          id="telefono"
          name="telefono"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
      </div>

      <div>
        <label htmlFor="foto" className="block text-sm font-medium text-slate-700">
          Foto (opcional)
        </label>
        <input
          id="foto"
          name="foto"
          type="file"
          accept="image/*"
          className="mt-1 w-full text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
        />
        <p className="mt-1 text-xs text-slate-500">Máximo 2MB.</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={pendiente}
        className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
      >
        {pendiente ? "Guardando…" : "Crear cliente"}
      </button>
    </form>
  );
}
