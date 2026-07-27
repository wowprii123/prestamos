import { describe, expect, it } from "vitest";
import { aplicarPago } from "./aplicar";
import { montoRecomendado } from "./recomendado";
import type { CuotaPendiente } from "./tipos";

function cuotas(): CuotaPendiente[] {
  return [
    { id: "c1", numero: 1, valorCuota: 120_000, montoPagado: 120_000 },
    { id: "c2", numero: 2, valorCuota: 120_000, montoPagado: 0 },
    { id: "c3", numero: 3, valorCuota: 120_000, montoPagado: 0 },
    { id: "c4", numero: 4, valorCuota: 120_000, montoPagado: 0 },
  ];
}

describe("montoRecomendado", () => {
  it("sugiere el saldo de la cuota pendiente más antigua", () => {
    const monto = montoRecomendado(cuotas());
    expect(monto?.toNumber()).toBe(120_000);
  });

  it("ignora cuotas ya pagadas y devuelve null si todas están pagadas", () => {
    const todasPagadas = cuotas().map((c) => ({ ...c, montoPagado: c.valorCuota }));
    expect(montoRecomendado(todasPagadas)).toBeNull();
  });

  it("recomienda el saldo restante de una cuota parcialmente pagada", () => {
    const conParcial = cuotas();
    conParcial[1].montoPagado = 50_000;
    expect(montoRecomendado(conParcial)?.toNumber()).toBe(70_000);
  });
});

describe("aplicarPago", () => {
  it("pago recomendado: cubre exactamente la cuota más antigua pendiente", () => {
    const { aplicaciones, sobrante } = aplicarPago(cuotas(), 120_000);

    expect(aplicaciones).toHaveLength(1);
    expect(aplicaciones[0].cuotaId).toBe("c2");
    expect(aplicaciones[0].nuevoEstado).toBe("pagada");
    expect(sobrante.toNumber()).toBe(0);
  });

  it("pago libre mayor a una cuota: se reparte entre varias cuotas en orden", () => {
    const { aplicaciones, sobrante } = aplicarPago(cuotas(), 180_000);

    expect(aplicaciones).toHaveLength(2);
    expect(aplicaciones[0]).toMatchObject({
      cuotaId: "c2",
      montoAplicado: expect.anything(),
      nuevoEstado: "pagada",
    });
    expect(aplicaciones[0].montoAplicado.toNumber()).toBe(120_000);
    expect(aplicaciones[1].cuotaId).toBe("c3");
    expect(aplicaciones[1].montoAplicado.toNumber()).toBe(60_000);
    expect(aplicaciones[1].nuevoEstado).toBe("parcial");
    expect(sobrante.toNumber()).toBe(0);
  });

  it("abono inferior a una cuota: queda una sola aplicación parcial", () => {
    const { aplicaciones, sobrante } = aplicarPago(cuotas(), 45_000);

    expect(aplicaciones).toHaveLength(1);
    expect(aplicaciones[0].cuotaId).toBe("c2");
    expect(aplicaciones[0].montoAplicado.toNumber()).toBe(45_000);
    expect(aplicaciones[0].nuevoEstado).toBe("parcial");
    expect(sobrante.toNumber()).toBe(0);
  });

  it("continúa un abono previo: la cuota parcial se completa antes de pasar a la siguiente", () => {
    const conParcial = cuotas();
    conParcial[1].montoPagado = 45_000;

    const { aplicaciones } = aplicarPago(conParcial, 100_000);

    expect(aplicaciones[0].cuotaId).toBe("c2");
    expect(aplicaciones[0].montoAplicado.toNumber()).toBe(75_000);
    expect(aplicaciones[0].nuevoEstado).toBe("pagada");
    expect(aplicaciones[1].cuotaId).toBe("c3");
    expect(aplicaciones[1].montoAplicado.toNumber()).toBe(25_000);
    expect(aplicaciones[1].nuevoEstado).toBe("parcial");
  });

  it("pago que excede el saldo total pendiente devuelve el excedente como sobrante", () => {
    const soloUnaCuota: CuotaPendiente[] = [
      { id: "c1", numero: 1, valorCuota: 100_000, montoPagado: 0 },
    ];

    const { aplicaciones, sobrante } = aplicarPago(soloUnaCuota, 150_000);

    expect(aplicaciones).toHaveLength(1);
    expect(aplicaciones[0].montoAplicado.toNumber()).toBe(100_000);
    expect(sobrante.toNumber()).toBe(50_000);
  });

  it("rechaza montos de pago menores o iguales a cero", () => {
    expect(() => aplicarPago(cuotas(), 0)).toThrow();
    expect(() => aplicarPago(cuotas(), -10)).toThrow();
  });
});
