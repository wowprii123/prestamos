"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cerrarSesion } from "@/lib/auth-actions";

export interface EnlaceSidebar {
  href: string;
  label: string;
}

interface SidebarProps {
  titulo: string;
  nombre: string;
  enlaces: EnlaceSidebar[];
}

export function Sidebar({ titulo, nombre, enlaces }: SidebarProps) {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      {/* Barra superior: solo visible en móvil/tablet (<lg), reemplaza al sidebar fijo */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <span className="text-sm font-semibold text-slate-900">{titulo}</span>
        <button
          type="button"
          onClick={() => setAbierto(true)}
          aria-label="Abrir menú"
          className="rounded-md p-2 text-slate-600 hover:bg-slate-100"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {abierto && (
        <div
          onClick={() => setAbierto(false)}
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
        />
      )}

      <aside
        style={abierto ? { translate: "0px" } : undefined}
        className="fixed inset-y-0 left-0 z-50 flex h-screen w-60 shrink-0 -translate-x-full flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-out lg:sticky lg:top-0 lg:translate-x-0"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <span className="text-sm font-semibold text-slate-900">{titulo}</span>
          <button
            type="button"
            onClick={() => setAbierto(false)}
            aria-label="Cerrar menú"
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {enlaces.map((enlace) => {
            const activo = pathname === enlace.href || pathname.startsWith(`${enlace.href}/`);
            return (
              <Link
                key={enlace.href}
                href={enlace.href}
                onClick={() => setAbierto(false)}
                className={`block rounded-md px-3 py-2 text-sm font-medium transition ${
                  activo
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {enlace.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 px-5 py-4">
          <p className="mb-2 truncate text-sm text-slate-500">{nombre}</p>
          <form action={cerrarSesion}>
            <button
              type="submit"
              className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
