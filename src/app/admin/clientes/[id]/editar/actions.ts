"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";
import { actualizarCliente } from "@/lib/servicios/clientes";
import { archivoADataUrl } from "@/lib/archivo-a-data-url";

const esquemaCliente = z.object({
  clienteId: z.string().min(1),
  nombre: z.string().min(1, "El nombre es obligatorio"),
  direccion: z.string().min(1, "La dirección es obligatoria"),
  telefono: z.string().optional(),
});

export async function actualizarClienteAction(
  _estadoPrevio: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  const session = await auth();
  if (!session) return "No autorizado";

  const parsed = esquemaCliente.safeParse({
    clienteId: formData.get("clienteId"),
    nombre: formData.get("nombre"),
    direccion: formData.get("direccion"),
    telefono: formData.get("telefono") || undefined,
  });
  if (!parsed.success) return parsed.error.issues[0].message;

  let foto: string | undefined;
  const archivoFoto = formData.get("foto");
  try {
    if (archivoFoto instanceof File && archivoFoto.size > 0) {
      foto = await archivoADataUrl(archivoFoto);
    }
  } catch (error) {
    return error instanceof Error ? error.message : "No se pudo procesar la foto";
  }

  const { clienteId, ...datos } = parsed.data;

  try {
    await actualizarCliente(clienteId, { ...datos, foto });
  } catch (error) {
    return error instanceof Error ? error.message : "Error inesperado";
  }

  redirect(`/admin/clientes/${clienteId}`);
}
