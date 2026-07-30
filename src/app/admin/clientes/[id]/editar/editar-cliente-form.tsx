"use client";

import { useActionState } from "react";
import { actualizarClienteAction } from "./actions";

interface ClienteActual {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string | null;
  foto: string | null;
}

export function EditarClienteForm({ cliente }: { cliente: ClienteActual }) {
  const [error, formAction, pendiente] = useActionState(actualizarClienteAction, undefined);

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

      <div>
        <label htmlFor="foto" className="block text-sm font-medium text-slate-700">
          Foto
        </label>
        <div className="mt-1 flex items-center gap-3">
          {cliente.foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cliente.foto}
              alt={cliente.nombre}
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-400">
              Sin foto
            </div>
          )}
          <input
            id="foto"
            name="foto"
            type="file"
            accept="image/*"
            className="text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
          />
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Máximo 8MB. Deja este campo vacío para conservar la foto actual.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={pendiente}
        className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
      >
        {pendiente ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}
