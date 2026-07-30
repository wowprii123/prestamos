import Link from "next/link";
import { Card } from "@/components/ui/card";
import { listarClientes } from "@/lib/servicios/clientes";
import { NuevoPrestamoForm } from "./nuevo-prestamo-form";

export default async function NuevoPrestamoPage() {
  const clientes = await listarClientes();

  return (
    <div className="max-w-md space-y-6">
      <h1 className="text-lg font-semibold text-slate-900">Nuevo préstamo</h1>
      <Card>
        {clientes.length === 0 ? (
          <p className="text-sm text-slate-500">
            Todavía no hay clientes registrados.{" "}
            <Link href="/admin/clientes/nuevo" className="font-medium text-slate-900 underline">
              Crea uno primero
            </Link>
            .
          </p>
        ) : (
          <NuevoPrestamoForm clientes={clientes} />
        )}
      </Card>
    </div>
  );
}
