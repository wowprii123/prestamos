import { describe, expect, it } from "vitest";
import { generarTablaAmortizacion } from "./calcular";

describe("generarTablaAmortizacion (interés simple)", () => {
  it("reproduce el ejemplo exacto: 100.000 al 20%, 2 cuotas -> 60.000 c/u", () => {
    const { valorCuota, cuotas } = generarTablaAmortizacion({
      monto: 100_000,
      tasaPorcentaje: 20,
      periodo: "mensual",
      numeroCuotas: 2,
      fechaDesembolso: new Date("2026-01-01"),
    });

    expect(valorCuota.toNumber()).toBe(60_000);
    expect(cuotas).toHaveLength(2);

    expect(cuotas[0].capital.toNumber()).toBe(50_000);
    expect(cuotas[0].interes.toNumber()).toBe(10_000);
    expect(cuotas[0].valorCuota.toNumber()).toBe(60_000);
    expect(cuotas[0].saldoRestante.toNumber()).toBe(50_000);

    expect(cuotas[1].capital.toNumber()).toBe(50_000);
    expect(cuotas[1].interes.toNumber()).toBe(10_000);
    expect(cuotas[1].valorCuota.toNumber()).toBe(60_000);
    expect(cuotas[1].saldoRestante.toNumber()).toBe(0);
  });

  it("el interés total (monto x tasa) se reparte en partes iguales entre las cuotas", () => {
    const { cuotas } = generarTablaAmortizacion({
      monto: 1_000_000,
      tasaPorcentaje: 10,
      periodo: "mensual",
      numeroCuotas: 5,
      fechaDesembolso: new Date("2026-01-01"),
    });

    const interesPorCuotaEsperado = 20_000; // (1.000.000 * 10%) / 5
    for (const cuota of cuotas) {
      expect(cuota.interes.toNumber()).toBe(interesPorCuotaEsperado);
    }
  });

  it("la suma de los intereses de todas las cuotas es exacta (monto x tasa), con residuo en la última", () => {
    const { cuotas } = generarTablaAmortizacion({
      monto: 100_000,
      tasaPorcentaje: 20,
      periodo: "mensual",
      numeroCuotas: 3,
      fechaDesembolso: new Date("2026-01-01"),
    });

    const sumaIntereses = cuotas.reduce((acc, c) => acc + c.interes.toNumber(), 0);
    expect(sumaIntereses).toBeCloseTo(20_000, 2);
  });

  it("el capital se reparte en partes iguales y la última cuota absorbe el redondeo", () => {
    const { cuotas } = generarTablaAmortizacion({
      monto: 100_000,
      tasaPorcentaje: 20,
      periodo: "mensual",
      numeroCuotas: 3,
      fechaDesembolso: new Date("2026-01-01"),
    });

    expect(cuotas[0].capital.toNumber()).toBe(33_333.33);
    expect(cuotas[1].capital.toNumber()).toBe(33_333.33);
    expect(cuotas[2].capital.toNumber()).toBe(33_333.34);

    const sumaCapital = cuotas.reduce((acc, c) => acc + c.capital.toNumber(), 0);
    expect(sumaCapital).toBeCloseTo(100_000, 2);
  });

  it("el saldo restante de la última cuota es exactamente cero", () => {
    const { cuotas } = generarTablaAmortizacion({
      monto: 500_000,
      tasaPorcentaje: 8,
      periodo: "quincenal",
      numeroCuotas: 4,
      fechaDesembolso: new Date("2026-01-01"),
    });

    expect(cuotas.at(-1)!.saldoRestante.toNumber()).toBe(0);
  });

  it("la suma de capitales pagados es igual al monto prestado", () => {
    const monto = 750_000;
    const { cuotas } = generarTablaAmortizacion({
      monto,
      tasaPorcentaje: 15,
      periodo: "semanal",
      numeroCuotas: 7,
      fechaDesembolso: new Date("2026-01-01"),
    });

    const sumaCapital = cuotas.reduce((acc, c) => acc + c.capital.toNumber(), 0);
    expect(sumaCapital).toBeCloseTo(monto, 1);
  });

  it("las fechas de vencimiento avanzan según el período elegido", () => {
    const { cuotas } = generarTablaAmortizacion({
      monto: 300_000,
      tasaPorcentaje: 5,
      periodo: "semanal",
      numeroCuotas: 4,
      fechaDesembolso: new Date("2026-01-01"),
    });

    expect(cuotas[0].fechaVencimiento.toISOString().slice(0, 10)).toBe("2026-01-08");
    expect(cuotas[3].fechaVencimiento.toISOString().slice(0, 10)).toBe("2026-01-29");
  });

  it("tasa de 0% deja el interés en cero y reparte solo capital", () => {
    const { cuotas } = generarTablaAmortizacion({
      monto: 90_000,
      tasaPorcentaje: 0,
      periodo: "mensual",
      numeroCuotas: 3,
      fechaDesembolso: new Date("2026-01-01"),
    });

    for (const cuota of cuotas) {
      expect(cuota.interes.toNumber()).toBe(0);
      expect(cuota.capital.toNumber()).toBe(cuota.valorCuota.toNumber());
    }
  });

  it("lanza error si el número de cuotas es menor a 1", () => {
    expect(() =>
      generarTablaAmortizacion({
        monto: 100_000,
        tasaPorcentaje: 20,
        periodo: "mensual",
        numeroCuotas: 0,
        fechaDesembolso: new Date("2026-01-01"),
      }),
    ).toThrow();
  });
});
