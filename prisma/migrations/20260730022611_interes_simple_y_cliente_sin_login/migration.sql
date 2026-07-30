/*
  Warnings:

  - You are about to drop the column `tasa_mensual` on the `prestamos` table. All the data in the column will be lost.
  - You are about to drop the column `tasa_periodo` on the `prestamos` table. All the data in the column will be lost.
  - You are about to drop the column `rol` on the `usuarios` table. All the data in the column will be lost.
  - Added the required column `tasa_porcentaje` to the `prestamos` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "prestamos" DROP CONSTRAINT "prestamos_cliente_id_fkey";

-- AlterTable
ALTER TABLE "prestamos" DROP COLUMN "tasa_mensual",
DROP COLUMN "tasa_periodo",
ADD COLUMN     "tasa_porcentaje" DECIMAL(6,3) NOT NULL;

-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "rol";

-- DropEnum
DROP TYPE "RolUsuario";

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "telefono" TEXT,
    "foto" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "prestamos" ADD CONSTRAINT "prestamos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
