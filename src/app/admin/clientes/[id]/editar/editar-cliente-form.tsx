"use client";

import { useActionState, useState } from "react";
import { actualizarClienteAction } from "./actions";
import { SelectorFoto } from "@/components/clientes/selector-foto";

interface ClienteActual {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string | null;
  foto: string | null;
  foto2: string | null;
  notas: string | null;
}

export function EditarClienteForm({ cliente }: { cliente: ClienteActual }) {
  const [error, formAction, pendiente] = useActionState(actualizarClienteAction, undefined);
  const [foto1Procesando, setFoto1Procesando] = useState(false);
  const [foto2Procesando, setFoto2Procesando] = useState(false);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="clienteId" value={cliente.id} />

      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-slate-700">
          Nombre completo
        </label>
        <input
          id="nombre"
          name="nombre"
          required
          defaultValue={cliente.nombre}
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
          defaultValue={cliente.direccion}
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
          defaultValue={cliente.telefono ?? ""}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectorFoto
          nombre="foto"
          etiqueta="Foto 1"
          fotoInicial={cliente.foto}
          ayuda="Elige una foto nueva para reemplazarla, o déjala así para conservar la actual."
          onProcesandoChange={setFoto1Procesando}
        />
        <SelectorFoto
          nombre="foto2"
          etiqueta="Foto 2"
          fotoInicial={cliente.foto2}
          ayuda="Elige una foto nueva para reemplazarla, o déjala así para conservar la actual."
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
          defaultValue={cliente.notas ?? ""}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={pendiente || foto1Procesando || foto2Procesando}
        className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
      >
        {pendiente ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}
