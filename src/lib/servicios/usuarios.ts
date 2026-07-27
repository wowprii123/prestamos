import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export interface RegistrarClienteInput {
  nombre: string;
  email: string;
  password: string;
  telefono?: string;
}

export async function registrarCliente(input: RegistrarClienteInput) {
  const hashPassword = await bcrypt.hash(input.password, 10);
  return prisma.usuario.create({
    data: {
      nombre: input.nombre,
      email: input.email,
      hashPassword,
      telefono: input.telefono,
      rol: "cliente",
    },
  });
}

export async function listarClientes() {
  return prisma.usuario.findMany({
    where: { rol: "cliente" },
    orderBy: { nombre: "asc" },
  });
}

export async function listarClientesConResumen() {
  return prisma.usuario.findMany({
    where: { rol: "cliente" },
    orderBy: { nombre: "asc" },
    include: { _count: { select: { prestamosComoCliente: true } } },
  });
}
