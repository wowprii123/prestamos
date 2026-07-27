import { describe, expect, it } from "vitest";
import { generarTablaAmortizacion } from "./calcular";

describe("generarTablaAmortizacion", () => {
  it("calcula la cuota fija esperada para 1.000.000 al 5% mensual en 6 cuotas", () => {
    const { valorCuota, cuotas } = generarTablaAmortizacion({
      monto: 1_000_000,
      tasaMensualPorcentaje: 5,
      periodo: "mensual",
      numeroCuotas: 6,
      fechaDesembolso: new Date("2026-01-01"),
    });

    expect(valorCuota.toNumber()).toBeCloseTo(197017.47, 1);
    expect(cuotas).toHaveLength(6);
  });

  it("el saldo restante de la última cuota es exactamente cero", () => {
    const { cuotas } = generarTablaAmortizacion({
      monto: 1_000_000,
      tasaMensualPorcentaje: 5,
      periodo: "mensual",
      numeroCuotas: 6,
      fechaDesembolso: new Date("2026-01-01"),
    });

    const ultima = cuotas[cuotas.length - 1];
    expect(ultima.saldoRestante.toNumber()).toBe(0);
  });

  it("la suma de capitales pagados es igual al monto prestado", () => {
    const monto = 1_000_000;
    const { cuotas } = generarTablaAmortizacion({
      monto,
      tasaMensualPorcentaje: 5,
      periodo: "mensual",
      numeroCuotas: 6,
      fechaDesembolso: new Date("2026-01-01"),
    });

    const sumaCapital = cuotas.reduce((acc, c) => acc + c.capital.toNumber(), 0);
    expect(sumaCapital).toBeCloseTo(monto, 1);
  });

  it("el interés decrece y el capital crece en cada cuota (saldo decreciente)", () => {
    const { cuotas } = generarTablaAmortizacion({
      monto: 5_000_000,
      tasaMensualPorcentaje: 3.5,
      periodo: "mensual",
      numeroCuotas: 12,
      fechaDesembolso: new Date("2026-01-01"),
    });

    for (let i = 1; i < cuotas.length; i++) {
      expect(cuotas[i].interes.lte(cuotas[i - 1].interes)).toBe(true);
      expect(cuotas[i].capital.gte(cuotas[i - 1].capital)).toBe(true);
    }
  });

  it("convierte correctamente la tasa mensual a periodo quincenal, semanal y diario", () => {
    const casos = [
      { periodo: "quincenal" as const, cuotas: 4 },
      { periodo: "semanal" as const, cuotas: 8 },
      { periodo: "diario" as const, cuotas: 30 },
    ];

    for (const caso of casos) {
      const { cuotas } = generarTablaAmortizacion({
        monto: 500_000,
        tasaMensualPorcentaje: 8,
        periodo: caso.periodo,
        numeroCuotas: caso.cuotas,
        fechaDesembolso: new Date("2026-01-01"),
      });
      expect(cuotas).toHaveLength(caso.cuotas);
      expect(cuotas.at(-1)!.saldoRestante.toNumber()).toBe(0);
    }
  });

  it("las fechas de vencimiento avanzan según el período", () => {
    const { cuotas } = generarTablaAmortizacion({
      monto: 300_000,
      tasaMensualPorcentaje: 4,
      periodo: "semanal",
      numeroCuotas: 4,
      fechaDesembolso: new Date("2026-01-01"),
    });

    expect(cuotas[0].fechaVencimiento.toISOString().slice(0, 10)).toBe("2026-01-08");
    expect(cuotas[3].fechaVencimiento.toISOString().slice(0, 10)).toBe("2026-01-29");
  });

  it("lanza error si el número de cuotas es menor a 1", () => {
    expect(() =>
      generarTablaAmortizacion({
        monto: 100_000,
        tasaMensualPorcentaje: 5,
        periodo: "mensual",
        numeroCuotas: 0,
        fechaDesembolso: new Date("2026-01-01"),
      }),
    ).toThrow();
  });
});
