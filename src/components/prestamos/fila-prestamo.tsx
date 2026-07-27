"use client";

import { useRouter } from "next/navigation";

/** Fila de tabla que navega al hacer click en cualquier parte (no solo en el link interno). */
export function FilaPrestamo({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <tr onClick={() => router.push(href)} className="cursor-pointer hover:bg-slate-50">
      {children}
    </tr>
  );
}
