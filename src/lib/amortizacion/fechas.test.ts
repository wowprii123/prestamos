import { describe, expect, it } from "vitest";
import { fechaVencimientoCuota } from "./fechas";

function iso(fecha: Date): string {
  return fecha.toISOString().slice(0, 10);
}

describe("fechaVencimientoCuota (quincenal)", () => {
  it("ancla al 15 y 30 del mes en vez de contar 15 días corridos (caso reportado)", () => {
    const desembolso = new Date("2026-08-01");
    const fechas = [1, 2, 3, 4].map((numero) =>
      iso(fechaVencimientoCuota(desembolso, "quincenal", numero)),
    );

    expect(fechas).toEqual(["2026-08-15", "2026-08-30", "2026-09-15", "2026-09-30"]);
  });

  it("no se desalinea al cruzar varios meses de 31 días seguidos", () => {
    const desembolso = new Date("2026-07-01");
    const fechas = [1, 2, 3, 4, 5, 6].map((numero) =>
      iso(fechaVencimientoCuota(desembolso, "quincenal", numero)),
    );

    expect(fechas).toEqual([
      "2026-07-15",
      "2026-07-30",
      "2026-08-15",
      "2026-08-30",
      "2026-09-15",
      "2026-09-30",
    ]);
  });

  it("en febrero usa el último día del mes en vez de un 30 inexistente", () => {
    const desembolso = new Date("2026-01-20");
    const fechas = [1, 2, 3].map((numero) =>
      iso(fechaVencimientoCuota(desembolso, "quincenal", numero)),
    );

    // 2026 no es bisiesto: febrero termina el 28.
    expect(fechas).toEqual(["2026-01-30", "2026-02-15", "2026-02-28"]);
  });

  it("si se desembolsa justo en un 15 o 30, la cuota empieza en el siguiente punto", () => {
    const desembolso = new Date("2026-08-15");
    expect(iso(fechaVencimientoCuota(desembolso, "quincenal", 1))).toBe("2026-08-30");
  });
});
