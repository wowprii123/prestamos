"use client";

import { useState, useTransition } from "react";
import { anularPrestamoAction } from "./prestamo-actions";

export function AnularPrestamo({ prestamoId }: { prestamoId: string }) {
  const [pendiente, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function manejarClick() {
    const confirmado = window.confirm(
      "¿Anular este préstamo? Quedará marcado como cancelado y no se le podrán registrar más pagos. Esta acción no se puede deshacer desde aquí.",
    );
    if (!confirmado) return;

    setError(null);
    startTransition(async () => {
      const resultado = await anularPrestamoAction(prestamoId);
      if (!resultado.ok) {
        setError(resultado.mensaje ?? "No se pudo anular el préstamo");
      }
    });
  }

  return (
    <div>
      <p className="mb-3 text-xs text-slate-500">
        El préstamo quedará como cancelado. Las cuotas y pagos ya registrados no se modifican.
      </p>
      <button
        type="button"
        onClick={manejarClick}
        disabled={pendiente}
        className="rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50"
      >
        {pendiente ? "Anulando…" : "Anular préstamo"}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
