"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";
import { registrarCliente } from "@/lib/servicios/usuarios";

const esquemaCliente = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  telefono: z.string().optional(),
});

export async function crearClienteAction(
  _estadoPrevio: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  const session = await auth();
  if (!session || session.user.rol !== "admin") return "No autorizado";

  const parsed = esquemaCliente.safeParse({
    nombre: formData.get("nombre"),
    email: formData.get("email"),
    password: formData.get("password"),
    telefono: formData.get("telefono") || undefined,
  });
  if (!parsed.success) return parsed.error.issues[0].message;

  try {
    await registrarCliente(parsed.data);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return "Ya existe un usuario con ese correo";
    }
    return error instanceof Error ? error.message : "Error inesperado";
  }

  redirect("/admin/clientes");
}
