import { prisma } from "@/lib/db";
import { saldoPendientePrestamo } from "@/lib/pagos";

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

export async function obtenerCliente(id: string) {
  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: { prestamos: { include: { cuotas: true }, orderBy: { creadoEn: "desc" } } },
  });
  if (!cliente) return null;

  return {
    ...cliente,
    prestamos: cliente.prestamos.map((prestamo) => ({
      ...prestamo,
      saldoPendiente: saldoPendientePrestamo(prestamo.cuotas),
    })),
  };
}

export interface ActualizarClienteInput {
  nombre: string;
  direccion: string;
  telefono?: string;
  /** Solo se envía si se subió una foto nueva; si no, se conserva la actual. */
  foto?: string;
}

export async function actualizarCliente(id: string, input: ActualizarClienteInput) {
  return prisma.cliente.update({
    where: { id },
    data: {
      nombre: input.nombre,
      direccion: input.direccion,
      telefono: input.telefono,
      ...(input.foto ? { foto: input.foto } : {}),
    },
  });
}
