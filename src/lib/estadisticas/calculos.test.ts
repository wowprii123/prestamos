import { describe, expect, it } from "vitest";
import { calcularResumenEstadisticas, interesDeAplicacion, interesPendienteCuota } from "./calculos";

describe("interesDeAplicacion", () => {
  it("un abono que paga la cuota completa contiene exactamente el interés de la cuota", () => {
    const interes = interesDeAplicacion({
      montoAplicado: 197_017.47,
      cuotaInteres: 50_000,
      cuotaValorCuota: 197_017.47,
    });
    expect(interes.toNumber()).toBeCloseTo(50_000, 2);
  });

  it("un abono parcial contiene interés proporcional a lo abonado", () => {
    // Cuota de 100.000 con 40.000 de interés (40%). Abono de 50.000 -> 20.000 de interés.
    const interes = interesDeAplicacion({
      montoAplicado: 50_000,
      cuotaInteres: 40_000,
      cuotaValorCuota: 100_000,
    });
    expect(interes.toNumber()).toBe(20_000);
  });

  it("devuelve cero si la cuota tiene valor cero (evita división por cero)", () => {
    const interes = interesDeAplicacion({
      montoAplicado: 0,
      cuotaInteres: 0,
      cuotaValorCuota: 0,
    });
    expect(interes.toNumber()).toBe(0);
  });
});

describe("interesPendienteCuota", () => {
  it("es cero si la cuota ya está completamente pagada", () => {
    const interes = interesPendienteCuota({
      valorCuota: 100_000,
      montoPagado: 100_000,
      interes: 40_000,
    });
    expect(interes.toNumber()).toBe(0);
  });

  it("es el interés completo si nada se ha pagado todavía", () => {
    const interes = interesPendienteCuota({
      valorCuota: 100_000,
      montoPagado: 0,
      interes: 40_000,
    });
    expect(interes.toNumber()).toBe(40_000);
  });

  it("es proporcional al saldo pendiente en un abono parcial", () => {
    // Cuota de 100.000 con 40.000 de interés (40%). Pagado 50.000, faltan 50.000 -> 20.000 de interés.
    const interes = interesPendienteCuota({
      valorCuota: 100_000,
      montoPagado: 50_000,
      interes: 40_000,
    });
    expect(interes.toNumber()).toBe(20_000);
  });
});

describe("calcularResumenEstadisticas", () => {
  it("suma correctamente prestado, recuperado, intereses pagados/futuros y saldo pendiente", () => {
    const resumen = calcularResumenEstadisticas({
      montosPrestamos: [1_000_000, 500_000],
      aplicaciones: [
        { montoAplicado: 197_017.47, cuotaInteres: 50_000, cuotaValorCuota: 197_017.47 },
        { montoAplicado: 50_000, cuotaInteres: 40_000, cuotaValorCuota: 100_000 },
      ],
      cuotasAbiertas: [
        { valorCuota: 197_017.47, montoPagado: 197_017.47, interes: 50_000 },
        { valorCuota: 197_017.47, montoPagado: 0, interes: 50_000 },
      ],
    });

    expect(resumen.totalPrestado.toNumber()).toBe(1_500_000);
    expect(resumen.totalRecuperado.toNumber()).toBeCloseTo(247_017.47, 2);
    expect(resumen.interesesPagados.toNumber()).toBeCloseTo(70_000, 2);
    expect(resumen.saldoTotalPendiente.toNumber()).toBeCloseTo(197_017.47, 2);
    expect(resumen.interesesFuturos.toNumber()).toBe(50_000);
  });

  it("devuelve todo en cero cuando no hay datos en el rango", () => {
    const resumen = calcularResumenEstadisticas({
      montosPrestamos: [],
      aplicaciones: [],
      cuotasAbiertas: [],
    });

    expect(resumen.totalPrestado.toNumber()).toBe(0);
    expect(resumen.totalRecuperado.toNumber()).toBe(0);
    expect(resumen.interesesPagados.toNumber()).toBe(0);
    expect(resumen.interesesFuturos.toNumber()).toBe(0);
    expect(resumen.saldoTotalPendiente.toNumber()).toBe(0);
  });
});
