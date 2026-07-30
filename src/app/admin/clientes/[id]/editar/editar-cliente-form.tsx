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
}

export function EditarClienteForm({ cliente }: { cliente: ClienteActual }) {
  const [error, formAction, pendiente] = useActionState(actualizarClienteAction, undefined);
  const [fotoProcesando, setFotoProcesando] = useState(false);

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

      <SelectorFoto
        nombre="foto"
        fotoInicial={cliente.foto}
        ayuda="Elige una foto nueva para reemplazarla, o déjala así para conservar la actual."
        onProcesandoChange={setFotoProcesando}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={pendiente || fotoProcesando}
        className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
      >
        {pendiente ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}
