"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";
import { registrarCliente } from "@/lib/servicios/clientes";
import { esquemaFotoDataUrl } from "@/lib/foto-data-url";

const esquemaCliente = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  direccion: z.string().min(1, "La dirección es obligatoria"),
  telefono: z.string().optional(),
  foto: esquemaFotoDataUrl,
});

export async function crearClienteAction(
  _estadoPrevio: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  const session = await auth();
  if (!session) return "No autorizado";

  const parsed = esquemaCliente.safeParse({
    nombre: formData.get("nombre"),
    direccion: formData.get("direccion"),
    telefono: formData.get("telefono") || undefined,
    foto: formData.get("foto"),
  });
  if (!parsed.success) return parsed.error.issues[0].message;

  try {
    await registrarCliente(parsed.data);
  } catch (error) {
    return error instanceof Error ? error.message : "Error inesperado";
  }

  redirect("/admin/clientes");
}
