"use client";

import { useState } from "react";
import { comprimirImagenADataUrl } from "@/lib/comprimir-imagen";

interface SelectorFotoProps {
  /** name del input oculto que viaja en el form (ya como data URL JPEG). */
  nombre: string;
  fotoInicial?: string | null;
  ayuda?: string;
  onProcesandoChange?: (procesando: boolean) => void;
}

export function SelectorFoto({
  nombre,
  fotoInicial = null,
  ayuda,
  onProcesandoChange,
}: SelectorFotoProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(fotoInicial);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function manejarCambio(evento: React.ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0];
    evento.target.value = ""; // permite volver a elegir el mismo archivo después

    if (!archivo) return;

    setError(null);
    setProcesando(true);
    onProcesandoChange?.(true);
    try {
      const comprimida = await comprimirImagenADataUrl(archivo);
      setDataUrl(comprimida);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo procesar la foto");
    } finally {
      setProcesando(false);
      onProcesandoChange?.(false);
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">Foto</label>
      <div className="mt-1 flex items-center gap-3">
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={dataUrl} alt="Foto del cliente" className="h-14 w-14 rounded-full object-cover" />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-400">
            Sin foto
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={manejarCambio}
          className="text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
        />
      </div>

      {procesando && <p className="mt-1 text-xs text-slate-500">Procesando imagen…</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {ayuda && !procesando && !error && <p className="mt-1 text-xs text-slate-500">{ayuda}</p>}

      <input type="hidden" name={nombre} value={dataUrl ?? ""} />
    </div>
  );
}
