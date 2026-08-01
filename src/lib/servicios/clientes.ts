import { prisma } from "@/lib/db";
import { saldoPendientePrestamo } from "@/lib/pagos";

export interface RegistrarClienteInput {
  nombre: string;
  direccion: string;
  telefono?: string;
  /** Data URL (base64) de cada foto, o undefined si no se subió. */
  foto?: string;
  foto2?: string;
  notas?: string;
}

export async function registrarCliente(input: RegistrarClienteInput) {
  return prisma.cliente.create({
    data: {
      nombre: input.nombre,
      direccion: input.direccion,
      telefono: input.telefono,
      foto: input.foto,
      foto2: input.foto2,
      notas: input.notas,
    },
  });
}

/** Solo id y nombre: para poblar el selector de cliente al crear un préstamo. */
export async function listarClientes() {
  return prisma.cliente.findMany({
    select: { id: true, nombre: true },
    orderBy: { nombre: "asc" },
  });
}

export async function listarClientesConResumen() {
  return prisma.cliente.findMany({
    orderBy: { nombre: "asc" },
    include: { _count: { select: { prestamos: true } } },
  });
}

/** Solo los datos propios del cliente, sin préstamos. Para pantallas (como
 * editar) que no necesitan la lista de préstamos y no deben pasarle a un
 * Client Component campos Decimal anidados. */
export async function obtenerClienteBasico(id: string) {
  return prisma.cliente.findUnique({ where: { id } });
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
  notas?: string;
  /** Solo se envían si se subió una foto nueva; si no, se conserva la actual. */
  foto?: string;
  foto2?: string;
}

export async function actualizarCliente(id: string, input: ActualizarClienteInput) {
  return prisma.cliente.update({
    where: { id },
    data: {
      nombre: input.nombre,
      direccion: input.direccion,
      telefono: input.telefono,
      notas: input.notas,
      ...(input.foto ? { foto: input.foto } : {}),
      ...(input.foto2 ? { foto2: input.foto2 } : {}),
    },
  });
}
