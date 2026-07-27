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
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        titulo="Préstamos · Admin"
        nombre={session.user.name ?? session.user.email ?? ""}
        enlaces={[
          { href: "/admin/clientes", label: "Clientes" },
          { href: "/admin/prestamos", label: "Préstamos" },
        ]}
      />
      <main className="flex-1 overflow-y-auto px-6 py-8 sm:px-10">{children}</main>
    </div>
  );
}
