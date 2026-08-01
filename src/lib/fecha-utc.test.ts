import { describe, expect, it } from "vitest";
import { addDiasUTC, addMesesUTC, diferenciaEnDias, inicioDeDiaUTC } from "./fecha-utc";

function iso(fecha: Date): string {
  return fecha.toISOString().slice(0, 10);
}

describe("addMesesUTC", () => {
  it("31 de julio + 1, 2 y 3 meses -> 31 ago, 30 sept, 31 oct (caso reportado)", () => {
    const desembolso = new Date("2026-07-31");
    expect(iso(addMesesUTC(desembolso, 1))).toBe("2026-08-31");
    expect(iso(addMesesUTC(desembolso, 2))).toBe("2026-09-30");
    expect(iso(addMesesUTC(desembolso, 3))).toBe("2026-10-31");
  });

  it("no se desborda al mes siguiente cuando el destino tiene menos días (31 de enero + 1 mes)", () => {
    expect(iso(addMesesUTC(new Date("2026-01-31"), 1))).toBe("2026-02-28");
  });

  it("respeta el año bisiesto (29 de febrero existe en 2028)", () => {
    expect(iso(addMesesUTC(new Date("2028-01-31"), 1))).toBe("2028-02-29");
  });

  it("no afecta fechas que no se desbordan (día 15)", () => {
    expect(iso(addMesesUTC(new Date("2026-01-15"), 1))).toBe("2026-02-15");
  });
});

describe("diferenciaEnDias", () => {
  it("es 0 para el mismo día", () => {
    const hoy = new Date("2026-07-27T00:00:00.000Z");
    expect(diferenciaEnDias(hoy, hoy)).toBe(0);
  });

  it("es positivo cuando la primera fecha es posterior (vence en N días)", () => {
    const hoy = new Date("2026-07-27T00:00:00.000Z");
    const enDiezDias = addDiasUTC(hoy, 10);
    expect(diferenciaEnDias(enDiezDias, hoy)).toBe(10);
  });

  it("es negativo cuando la primera fecha es anterior (vencida hace N días)", () => {
    const hoy = new Date("2026-07-27T00:00:00.000Z");
    const haceTresDias = addDiasUTC(hoy, -3);
    expect(diferenciaEnDias(haceTresDias, hoy)).toBe(-3);
  });

  it("ignora la hora del día, solo compara fechas calendario", () => {
    const mananaTarde = new Date("2026-07-28T23:59:00.000Z");
    const hoyTemprano = new Date("2026-07-27T00:01:00.000Z");
    expect(diferenciaEnDias(mananaTarde, hoyTemprano)).toBe(1);
  });
});

describe("inicioDeDiaUTC", () => {
  it("trunca la hora a medianoche UTC", () => {
    const fecha = new Date("2026-07-27T15:42:10.000Z");
    expect(inicioDeDiaUTC(fecha).toISOString()).toBe("2026-07-27T00:00:00.000Z");
  });
});
