import { Card } from "@/components/ui/card";
import { NuevoClienteForm } from "./nuevo-cliente-form";

export default function NuevoClientePage() {
  return (
    <div className="max-w-md space-y-6">
      <h1 className="text-lg font-semibold text-slate-900">Nuevo cliente</h1>
      <Card>
        <NuevoClienteForm />
      </Card>
    </div>
  );
}
