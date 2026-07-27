const ESTILOS: Record<string, string> = {
  activo: "bg-blue-50 text-blue-700 ring-blue-600/20",
  pagado: "bg-green-50 text-green-700 ring-green-600/20",
  en_mora: "bg-red-50 text-red-700 ring-red-600/20",
  cancelado: "bg-slate-100 text-slate-600 ring-slate-500/20",
  pendiente: "bg-slate-100 text-slate-600 ring-slate-500/20",
  parcial: "bg-amber-50 text-amber-700 ring-amber-600/20",
  pagada: "bg-green-50 text-green-700 ring-green-600/20",
  vencida: "bg-red-50 text-red-700 ring-red-600/20",
};

export function Badge({ estado, texto }: { estado: string; texto: string }) {
  const estilo = ESTILOS[estado] ?? "bg-slate-100 text-slate-600 ring-slate-500/20";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${estilo}`}
    >
      {texto}
    </span>
  );
}
