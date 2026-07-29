import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Sidebar } from "@/components/layout/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || session.user.rol !== "admin") redirect("/login");

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 lg:flex-row">
      <Sidebar
        titulo="Préstamos · Admin"
        nombre={session.user.name ?? session.user.email ?? ""}
        enlaces={[
          { href: "/admin/clientes", label: "Clientes" },
          { href: "/admin/prestamos", label: "Préstamos" },
          { href: "/admin/cobros", label: "Cobros" },
          { href: "/admin/estadisticas", label: "Estadísticas" },
        ]}
      />
      <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        {children}
      </main>
    </div>
  );
}
