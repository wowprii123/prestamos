import { describe, expect, it } from "vitest";
import { calcularResumenEstadisticas, interesDeAplicacion } from "./calculos";

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

describe("calcularResumenEstadisticas", () => {
  it("suma correctamente prestado, recuperado, intereses y saldo pendiente", () => {
    const resumen = calcularResumenEstadisticas({
      montosPrestamos: [1_000_000, 500_000],
      aplicaciones: [
        { montoAplicado: 197_017.47, cuotaInteres: 50_000, cuotaValorCuota: 197_017.47 },
        { montoAplicado: 50_000, cuotaInteres: 40_000, cuotaValorCuota: 100_000 },
      ],
      cuotasActivas: [
        { valorCuota: 197_017.47, montoPagado: 197_017.47 },
        { valorCuota: 197_017.47, montoPagado: 0 },
      ],
    });

    expect(resumen.totalPrestado.toNumber()).toBe(1_500_000);
    expect(resumen.totalRecuperado.toNumber()).toBeCloseTo(247_017.47, 2);
    expect(resumen.totalIntereses.toNumber()).toBeCloseTo(70_000, 2);
    expect(resumen.saldoTotalPendiente.toNumber()).toBeCloseTo(197_017.47, 2);
  });

  it("devuelve todo en cero cuando no hay datos en el rango", () => {
    const resumen = calcularResumenEstadisticas({
      montosPrestamos: [],
      aplicaciones: [],
      cuotasActivas: [],
    });

    expect(resumen.totalPrestado.toNumber()).toBe(0);
    expect(resumen.totalRecuperado.toNumber()).toBe(0);
    expect(resumen.totalIntereses.toNumber()).toBe(0);
    expect(resumen.saldoTotalPendiente.toNumber()).toBe(0);
  });
});
