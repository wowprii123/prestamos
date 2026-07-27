import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/db";
import { generarTablaAmortizacion } from "../src/lib/amortizacion";

async function main() {
  const hashAdmin = await bcrypt.hash("admin123", 10);
  const hashCliente = await bcrypt.hash("cliente123", 10);

  const admin = await prisma.usuario.upsert({
    where: { email: "admin@prestamos.local" },
    update: {},
    create: {
      email: "admin@prestamos.local",
      hashPassword: hashAdmin,
      nombre: "Administrador",
      rol: "admin",
    },
  });

  const cliente = await prisma.usuario.upsert({
    where: { email: "cliente@prestamos.local" },
    update: {},
    create: {
      email: "cliente@prestamos.local",
      hashPassword: hashCliente,
      nombre: "Cliente de Prueba",
      rol: "cliente",
      telefono: "+57 300 000 0000",
    },
  });

  const prestamoExistente = await prisma.prestamo.findFirst({
    where: { clienteId: cliente.id },
  });

  if (!prestamoExistente) {
    const monto = 1_000_000;
    const tasaMensualPorcentaje = 5;
    const periodo = "mensual" as const;
    const numeroCuotas = 6;
    const fechaDesembolso = new Date();

    const { tasaPeriodo, valorCuota, cuotas } = generarTablaAmortizacion({
      monto,
      tasaMensualPorcentaje,
      periodo,
      numeroCuotas,
      fechaDesembolso,
    });

    await prisma.prestamo.create({
      data: {
        clienteId: cliente.id,
        monto,
        tasaMensual: tasaMensualPorcentaje,
        tasaPeriodo: tasaPeriodo.toNumber(),
        periodo,
        numeroCuotas,
        valorCuota: valorCuota.toNumber(),
        fechaDesembolso,
        creadoPorId: admin.id,
        cuotas: {
          create: cuotas.map((cuota) => ({
            numero: cuota.numero,
            fechaVencimiento: cuota.fechaVencimiento,
            valorCuota: cuota.valorCuota.toNumber(),
            interes: cuota.interes.toNumber(),
            capital: cuota.capital.toNumber(),
            saldoRestante: cuota.saldoRestante.toNumber(),
          })),
        },
      },
    });
  }

  console.log("Seed completo. Usuarios de prueba:");
  console.log("  admin@prestamos.local   / admin123");
  console.log("  cliente@prestamos.local / cliente123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
