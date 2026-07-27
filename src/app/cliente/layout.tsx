import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Sidebar } from "@/components/layout/sidebar";

export default async function ClienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || session.user.rol !== "cliente") redirect("/login");

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        titulo="Mis Préstamos"
        nombre={session.user.name ?? session.user.email ?? ""}
        enlaces={[{ href: "/cliente", label: "Mis préstamos" }]}
      />
      <main className="flex-1 overflow-y-auto px-6 py-8 sm:px-10">{children}</main>
    </div>
  );
}
