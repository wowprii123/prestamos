import { prisma } from "@/lib/db";

export interface RegistrarClienteInput {
  nombre: string;
  direccion: string;
  telefono?: string;
  /** Data URL (base64) de la foto, o undefined si no se subió ninguna. */
  foto?: string;
}

export async function registrarCliente(input: RegistrarClienteInput) {
  return prisma.cliente.create({
    data: {
      nombre: input.nombre,
      direccion: input.direccion,
      telefono: input.telefono,
      foto: input.foto,
    },
  });
}

export async function listarClientes() {
  return prisma.cliente.findMany({ orderBy: { nombre: "asc" } });
}

export async function listarClientesConResumen() {
  return prisma.cliente.findMany({
    orderBy: { nombre: "asc" },
    include: { _count: { select: { prestamos: true } } },
  });
}
