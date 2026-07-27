-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('admin', 'cliente');

-- CreateEnum
CREATE TYPE "Periodo" AS ENUM ('diario', 'semanal', 'quincenal', 'mensual');

-- CreateEnum
CREATE TYPE "EstadoPrestamo" AS ENUM ('activo', 'pagado', 'en_mora', 'cancelado');

-- CreateEnum
CREATE TYPE "EstadoCuota" AS ENUM ('pendiente', 'parcial', 'pagada', 'vencida');

-- CreateEnum
CREATE TYPE "TipoPago" AS ENUM ('recomendado', 'libre');

-- CreateEnum
CREATE TYPE "TipoExtracto" AS ENUM ('mensual', 'acumulado');

-- CreateEnum
CREATE TYPE "EstadoEnvio" AS ENUM ('pendiente', 'enviado', 'fallido');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hash_password" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" "RolUsuario" NOT NULL,
    "telefono" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prestamos" (
    "id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "monto" DECIMAL(14,2) NOT NULL,
    "tasa_mensual" DECIMAL(6,3) NOT NULL,
    "tasa_periodo" DECIMAL(9,6) NOT NULL,
    "periodo" "Periodo" NOT NULL,
    "numero_cuotas" INTEGER NOT NULL,
    "valor_cuota" DECIMAL(14,2) NOT NULL,
    "fecha_desembolso" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoPrestamo" NOT NULL DEFAULT 'activo',
    "creado_por_id" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prestamos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cuotas" (
    "id" TEXT NOT NULL,
    "prestamo_id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "fecha_vencimiento" TIMESTAMP(3) NOT NULL,
    "valor_cuota" DECIMAL(14,2) NOT NULL,
    "interes" DECIMAL(14,2) NOT NULL,
    "capital" DECIMAL(14,2) NOT NULL,
    "saldo_restante" DECIMAL(14,2) NOT NULL,
    "monto_pagado" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "estado" "EstadoCuota" NOT NULL DEFAULT 'pendiente',

    CONSTRAINT "cuotas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos" (
    "id" TEXT NOT NULL,
    "prestamo_id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "monto" DECIMAL(14,2) NOT NULL,
    "tipo" "TipoPago" NOT NULL,
    "medio_pago" TEXT,
    "nota" TEXT,
    "registrado_por_id" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aplicaciones_pago" (
    "id" TEXT NOT NULL,
    "pago_id" TEXT NOT NULL,
    "cuota_id" TEXT NOT NULL,
    "monto_aplicado" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "aplicaciones_pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "extractos" (
    "id" TEXT NOT NULL,
    "prestamo_id" TEXT NOT NULL,
    "tipo" "TipoExtracto" NOT NULL,
    "periodo_inicio" TIMESTAMP(3) NOT NULL,
    "periodo_fin" TIMESTAMP(3) NOT NULL,
    "ruta_pdf" TEXT,
    "generado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "enviado_en" TIMESTAMP(3),
    "estado_envio" "EstadoEnvio" NOT NULL DEFAULT 'pendiente',
    "intentos_envio" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "extractos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "correos_enviados" (
    "id" TEXT NOT NULL,
    "extracto_id" TEXT NOT NULL,
    "destinatario" TEXT NOT NULL,
    "proveedor" TEXT NOT NULL DEFAULT 'zeptomail',
    "respuesta_api" JSONB,
    "estado" "EstadoEnvio" NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "correos_enviados_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "cuotas_prestamo_id_numero_key" ON "cuotas"("prestamo_id", "numero");

-- AddForeignKey
ALTER TABLE "prestamos" ADD CONSTRAINT "prestamos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prestamos" ADD CONSTRAINT "prestamos_creado_por_id_fkey" FOREIGN KEY ("creado_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuotas" ADD CONSTRAINT "cuotas_prestamo_id_fkey" FOREIGN KEY ("prestamo_id") REFERENCES "prestamos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_prestamo_id_fkey" FOREIGN KEY ("prestamo_id") REFERENCES "prestamos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_registrado_por_id_fkey" FOREIGN KEY ("registrado_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aplicaciones_pago" ADD CONSTRAINT "aplicaciones_pago_pago_id_fkey" FOREIGN KEY ("pago_id") REFERENCES "pagos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aplicaciones_pago" ADD CONSTRAINT "aplicaciones_pago_cuota_id_fkey" FOREIGN KEY ("cuota_id") REFERENCES "cuotas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extractos" ADD CONSTRAINT "extractos_prestamo_id_fkey" FOREIGN KEY ("prestamo_id") REFERENCES "prestamos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "correos_enviados" ADD CONSTRAINT "correos_enviados_extracto_id_fkey" FOREIGN KEY ("extracto_id") REFERENCES "extractos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
