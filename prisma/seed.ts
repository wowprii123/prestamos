import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/db";
import { generarTablaAmortizacion } from "../src/lib/amortizacion";

async function main() {
  const hashAdmin = await bcrypt.hash("admin123", 10);

  const admin = await prisma.usuario.upsert({
    where: { email: "davidjaramillo1191@gamil.com" },
    update: {},
    create: {
      email: "davidjaramillo1191@gamil.com",
      hashPassword: hashAdmin,
      nombre: "Administrador",
    },
  });

  let cliente = await prisma.cliente.findFirst({ where: { nombre: "Cliente de Prueba" } });
  if (!cliente) {
    cliente = await prisma.cliente.create({
      data: {
        nombre: "Cliente de Prueba",
        direccion: "Calle 10 # 20-30, Bogotá",
        telefono: "+57 300 000 0000",
      },
    });
  }

  const prestamoExistente = await prisma.prestamo.findFirst({
    where: { clienteId: cliente.id },
  });

  if (!prestamoExistente) {
    // Ejemplo de referencia: 100.000 al 20% mensual, 2 cuotas -> 70.000 c/u.
    const monto = 100_000;
    const tasaPorcentaje = 20;
    const periodo = "mensual" as const;
    const numeroCuotas = 2;
    const fechaDesembolso = new Date();

    const { valorCuota, cuotas } = generarTablaAmortizacion({
      monto,
      tasaMensualPorcentaje: tasaPorcentaje,
      periodo,
      numeroCuotas,
      fechaDesembolso,
    });

    await prisma.prestamo.create({
      data: {
        clienteId: cliente.id,
        monto,
        tasaPorcentaje,
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

  console.log("Seed completo. Admin de prueba:");
  console.log("  admin@prestamos.local / admin123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
