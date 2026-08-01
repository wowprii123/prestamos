import { notFound } from "next/navigation";
import { obtenerClienteBasico } from "@/lib/servicios/clientes";
import { Card } from "@/components/ui/card";
import { EditarClienteForm } from "./editar-cliente-form";

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cliente = await obtenerClienteBasico(id);
  if (!cliente) notFound();

  return (
    <div className="max-w-md space-y-6">
      <h1 className="text-lg font-semibold text-slate-900">Editar cliente</h1>
      <Card>
        <EditarClienteForm cliente={cliente} />
      </Card>
    </div>
  );
}
