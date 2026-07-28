import { describe, expect, it } from "vitest";
import { addDiasUTC, diferenciaEnDias, inicioDeDiaUTC } from "./fecha-utc";

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
