import Link from "next/link";
import { listarClientesConResumen } from "@/lib/servicios/usuarios";
import { formatearFecha } from "@/lib/formato";

export default async function AdminClientesPage() {
  const clientes = await listarClientesConResumen();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">Clientes</h1>
        <Link
          href="/admin/clientes/nuevo"
          className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          Nuevo cliente
        </Link>
      </div>

      {clientes.length === 0 ? (
        <p className="text-sm text-slate-500">Todavía no hay clientes registrados.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Correo</th>
                <th className="px-4 py-3">Teléfono</th>
                <th className="px-4 py-3 text-right">Préstamos</th>
                <th className="px-4 py-3">Registrado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clientes.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{cliente.nombre}</td>
                  <td className="px-4 py-3 text-slate-700">{cliente.email}</td>
                  <td className="px-4 py-3 text-slate-700">{cliente.telefono ?? "—"}</td>
                  <td className="px-4 py-3 text-right text-slate-700">
                    {cliente._count.prestamosComoCliente}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {formatearFecha(cliente.creadoEn)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
