"use client";

import { useActionState } from "react";
import { crearPrestamoAction } from "../actions";

interface ClienteOpcion {
  id: string;
  nombre: string;
}

const hoy = new Date().toISOString().slice(0, 10);

export function NuevoPrestamoForm({ clientes }: { clientes: ClienteOpcion[] }) {
  const [error, formAction, pendiente] = useActionState(crearPrestamoAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="clienteId" className="block text-sm font-medium text-slate-700">
          Cliente
        </label>
        <select
          id="clienteId"
          name="clienteId"
          required
          defaultValue=""
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        >
          <option value="" disabled>
            Selecciona un cliente
          </option>
          {clientes.map((cliente) => (
            <option key={cliente.id} value={cliente.id}>
              {cliente.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="monto" className="block text-sm font-medium text-slate-700">
            Monto a prestar
          </label>
          <input
            id="monto"
            name="monto"
            type="number"
            min="1"
            step="0.01"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>

        <div>
          <label
            htmlFor="tasaMensualPorcentaje"
            className="block text-sm font-medium text-slate-700"
          >
            Tasa mensual (%)
          </label>
          <input
            id="tasaMensualPorcentaje"
            name="tasaMensualPorcentaje"
            type="number"
            min="0"
            step="0.001"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="periodo" className="block text-sm font-medium text-slate-700">
            Período de pago
          </label>
          <select
            id="periodo"
            name="periodo"
            defaultValue="mensual"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          >
            <option value="diario">Diario</option>
            <option value="semanal">Semanal</option>
            <option value="quincenal">Quincenal</option>
            <option value="mensual">Mensual</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="numeroCuotas"
            className="block text-sm font-medium text-slate-700"
          >
            Número de cuotas
          </label>
          <input
            id="numeroCuotas"
            name="numeroCuotas"
            type="number"
            min="1"
            step="1"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="fechaDesembolso"
          className="block text-sm font-medium text-slate-700"
        >
          Fecha de desembolso
        </label>
        <input
          id="fechaDesembolso"
          name="fechaDesembolso"
          type="date"
          required
          defaultValue={hoy}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={pendiente}
        className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
      >
        {pendiente ? "Generando tabla de amortización…" : "Crear préstamo"}
      </button>
    </form>
  );
}
