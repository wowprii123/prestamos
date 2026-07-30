import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  formatearEstadoPrestamo,
  formatearFecha,
  formatearMoneda,
  formatearPeriodo,
} from "@/lib/formato";

export interface DatosResumenPrestamo {
  monto: { toString(): string };
  tasaPorcentaje: { toString(): string };
  periodo: string;
  numeroCuotas: number;
  valorCuota: { toString(): string };
  fechaDesembolso: Date;
  estado: string;
}

export function ResumenPrestamo({ prestamo }: { prestamo: DatosResumenPrestamo }) {
  return (
    <Card className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <Campo etiqueta="Monto" valor={formatearMoneda(prestamo.monto.toString())} />
      <Campo etiqueta="Tasa" valor={`${prestamo.tasaPorcentaje.toString()}%`} />
      <Campo etiqueta="Período" valor={formatearPeriodo(prestamo.periodo)} />
      <Campo etiqueta="Cuotas" valor={String(prestamo.numeroCuotas)} />
      <Campo
        etiqueta="Valor de cuota"
        valor={formatearMoneda(prestamo.valorCuota.toString())}
      />
      <Campo etiqueta="Desembolso" valor={formatearFecha(prestamo.fechaDesembolso)} />
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">Estado</p>
        <div className="mt-1">
          <Badge estado={prestamo.estado} texto={formatearEstadoPrestamo(prestamo.estado)} />
        </div>
      </div>
    </Card>
  );
}

function Campo({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500">{etiqueta}</p>
      <p className="mt-1 text-sm font-medium text-slate-900">{valor}</p>
    </div>
  );
}
