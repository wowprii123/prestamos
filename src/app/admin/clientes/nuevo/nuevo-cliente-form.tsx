"use client";

import { useActionState, useState } from "react";
import { crearClienteAction } from "../actions";
import { SelectorFoto } from "@/components/clientes/selector-foto";

export function NuevoClienteForm() {
  const [error, formAction, pendiente] = useActionState(crearClienteAction, undefined);
  const [foto1Procesando, setFoto1Procesando] = useState(false);
  const [foto2Procesando, setFoto2Procesando] = useState(false);

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectorFoto
          nombre="foto"
          etiqueta="Foto 1"
          ayuda="Se ajusta y comprime automáticamente al elegirla."
          onProcesandoChange={setFoto1Procesando}
        />
        <SelectorFoto
          nombre="foto2"
          etiqueta="Foto 2"
          ayuda="Se ajusta y comprime automáticamente al elegirla."
          onProcesandoChange={setFoto2Procesando}
        />
      </div>

      <div>
        <label htmlFor="notas" className="block text-sm font-medium text-slate-700">
          Notas (opcional)
        </label>
        <textarea
          id="notas"
          name="notas"
          rows={3}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={pendiente || foto1Procesando || foto2Procesando}
        className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
      >
        {pendiente ? "Guardando…" : "Crear cliente"}
      </button>
    </form>
  );
}
