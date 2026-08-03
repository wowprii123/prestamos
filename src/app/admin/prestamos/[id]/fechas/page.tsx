import Link from "next/link";
import { notFound } from "next/navigation";
import { obtenerPrestamo } from "@/lib/servicios/prestamos";
import { Card } from "@/components/ui/card";
import { ReconfigurarFechasForm } from "./reconfigurar-fechas-form";

export default async function ReconfigurarFechasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const prestamo = await obtenerPrestamo(id);
  if (!prestamo) notFound();

  const cuotas = prestamo.cuotas.map((cuota) => ({
    id: cuota.id,
    numero: cuota.numero,
    valorCuota: cuota.valorCuota.toString(),
    fechaVencimiento: cuota.fechaVencimiento.toISOString().slice(0, 10),
  }));

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link
          href={`/admin/prestamos/${prestamo.id}`}
          className="text-sm text-slate-500 hover:underline"
        >
          ← Volver al préstamo
        </Link>
        <h1 className="mt-1 text-lg font-semibold text-slate-900">
          Reconfigurar fechas de cuotas
        </h1>
        <p className="text-sm text-slate-500">Préstamo de {prestamo.cliente.nombre}</p>
      </div>

      <Card>
        <ReconfigurarFechasForm prestamoId={prestamo.id} cuotas={cuotas} />
      </Card>
    </div>
  );
}
