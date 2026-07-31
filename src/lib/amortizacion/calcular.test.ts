import { describe, expect, it } from "vitest";
import { generarTablaAmortizacion } from "./calcular";

describe("generarTablaAmortizacion (interés simple, tasa mensual prorrateada por período)", () => {
  it("mensual: 100.000 al 20%, 4 cuotas -> 45.000 c/u (interés 20.000/cuota, total 80.000)", () => {
    const { valorCuota, cuotas } = generarTablaAmortizacion({
      monto: 100_000,
      tasaMensualPorcentaje: 20,
      periodo: "mensual",
      numeroCuotas: 4,
      fechaDesembolso: new Date("2026-01-01"),
    });

    expect(valorCuota.toNumber()).toBe(45_000);
    for (const cuota of cuotas) {
      expect(cuota.capital.toNumber()).toBe(25_000);
      expect(cuota.interes.toNumber()).toBe(20_000);
      expect(cuota.valorCuota.toNumber()).toBe(45_000);
    }

    const interesTotal = cuotas.reduce((acc, c) => acc + c.interes.toNumber(), 0);
    expect(interesTotal).toBe(80_000);
    expect(cuotas.at(-1)!.saldoRestante.toNumber()).toBe(0);
  });

  it("quincenal: 100.000 al 20% mensual, 4 cuotas -> 35.000 c/u (interés 10.000/cuota, total 40.000)", () => {
    const { valorCuota, cuotas } = generarTablaAmortizacion({
      monto: 100_000,
      tasaMensualPorcentaje: 20,
      periodo: "quincenal",
      numeroCuotas: 4,
      fechaDesembolso: new Date("2026-01-01"),
    });

    expect(valorCuota.toNumber()).toBe(35_000);
    for (const cuota of cuotas) {
      expect(cuota.capital.toNumber()).toBe(25_000);
      expect(cuota.interes.toNumber()).toBe(10_000);
      expect(cuota.valorCuota.toNumber()).toBe(35_000);
    }

    const interesTotal = cuotas.reduce((acc, c) => acc + c.interes.toNumber(), 0);
    expect(interesTotal).toBe(40_000);
    expect(cuotas.at(-1)!.saldoRestante.toNumber()).toBe(0);
  });

  it("el ejemplo original (100.000 al 20% mensual, 2 cuotas) da 70.000 c/u", () => {
    const { cuotas } = generarTablaAmortizacion({
      monto: 100_000,
      tasaMensualPorcentaje: 20,
      periodo: "mensual",
      numeroCuotas: 2,
      fechaDesembolso: new Date("2026-01-01"),
    });

    expect(cuotas[0].valorCuota.toNumber()).toBe(70_000);
    expect(cuotas[1].valorCuota.toNumber()).toBe(70_000);
  });

  it("el capital se reparte en partes iguales y la última cuota absorbe el redondeo", () => {
    const { cuotas } = generarTablaAmortizacion({
      monto: 100_000,
      tasaMensualPorcentaje: 20,
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
      tasaMensualPorcentaje: 8,
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
      tasaMensualPorcentaje: 15,
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
      tasaMensualPorcentaje: 5,
      periodo: "semanal",
      numeroCuotas: 4,
      fechaDesembolso: new Date("2026-01-01"),
    });

    expect(cuotas[0].fechaVencimiento.toISOString().slice(0, 10)).toBe("2026-01-08");
    expect(cuotas[3].fechaVencimiento.toISOString().slice(0, 10)).toBe("2026-01-29");
  });

  it("semanal y diario prorratean sobre 30 días (7/30 y 1/30)", () => {
    const monto = 300_000;
    const tasaMensualPorcentaje = 30;

    const { cuotas: semanales } = generarTablaAmortizacion({
      monto,
      tasaMensualPorcentaje,
      periodo: "semanal",
      numeroCuotas: 1,
      fechaDesembolso: new Date("2026-01-01"),
    });
    expect(semanales[0].interes.toNumber()).toBeCloseTo((300_000 * 0.3 * 7) / 30, 2);

    const { cuotas: diarias } = generarTablaAmortizacion({
      monto,
      tasaMensualPorcentaje,
      periodo: "diario",
      numeroCuotas: 1,
      fechaDesembolso: new Date("2026-01-01"),
    });
    expect(diarias[0].interes.toNumber()).toBeCloseTo((300_000 * 0.3 * 1) / 30, 2);
  });

  it("tasa de 0% deja el interés en cero y reparte solo capital", () => {
    const { cuotas } = generarTablaAmortizacion({
      monto: 90_000,
      tasaMensualPorcentaje: 0,
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
        tasaMensualPorcentaje: 20,
        periodo: "mensual",
        numeroCuotas: 0,
        fechaDesembolso: new Date("2026-01-01"),
      }),
    ).toThrow();
  });
});
