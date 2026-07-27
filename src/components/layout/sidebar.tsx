"use client";

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

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <span className="text-sm font-semibold text-slate-900">{titulo}</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {enlaces.map((enlace) => {
          const activo = pathname === enlace.href || pathname.startsWith(`${enlace.href}/`);
          return (
            <Link
              key={enlace.href}
              href={enlace.href}
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
  );
}
