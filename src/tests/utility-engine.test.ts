import { describe, it, expect } from "vitest";
import { calculateUtilityTax } from "@/lib/utility-engine";
import type { UtilityInput } from "@/types/utility";

function input(overrides: Partial<UtilityInput>): UtilityInput {
  return {
    type: "energia",
    totalValue: 100,
    inputMode: "manual",
    regime: "atual",
    uf: "RO",
    ...overrides,
  };
}

// Arquitetura nova: o ICMS vem do caller via input.icmsRate (buscado no IBPT em tempo real).
// Os testes passam icmsRate explicitamente — nao dependem de dicionarios estaticos por UF.
describe("calculateUtilityTax — icmsRate injetado pelo caller (arquitetura IBPT-dinamica)", () => {
  it("energia SP com icmsRate=0,12 injetado (Lei 17.787/2023)", () => {
    const r = calculateUtilityTax(input({ uf: "SP", icmsRate: 0.12 }));
    expect(r.icmsRate).toBe(0.12);
    expect(r.icmsAmount).toBeCloseTo(12, 1);
  });

  it("energia RO com icmsRate=0,25 injetado (Decreto 21.959/2017)", () => {
    const r = calculateUtilityTax(input({ uf: "RO", icmsRate: 0.25 }));
    expect(r.icmsRate).toBe(0.25);
    expect(r.icmsAmount).toBeCloseTo(25, 1);
  });

  it("agua RO com icmsRate=0 injetado (isencao Decreto 12.051/2006)", () => {
    const r = calculateUtilityTax(input({ type: "agua", uf: "RO", icmsRate: 0 }));
    expect(r.icmsRate).toBe(0);
    expect(r.icmsAmount).toBe(0);
  });

  it("fallback nacional para energia quando icmsRate nao fornecido — usa media 25%", () => {
    // Sem icmsRate, o engine usa ICMS_ENERGIA_NACIONAL_MEDIA = 0.25
    const r = calculateUtilityTax(input({ uf: "SP" })); // sem icmsRate
    expect(r.icmsRate).toBe(0.25);
  });

  it("fallback nacional para agua quando icmsRate nao fornecido — usa media 12%", () => {
    // Sem icmsRate, o engine usa ICMS_AGUA_NACIONAL_MEDIA = 0.12
    const r = calculateUtilityTax(input({ type: "agua", uf: "RO" })); // sem icmsRate
    expect(r.icmsRate).toBe(0.12);
  });
});

describe("calculateUtilityTax — cascata ICMS sobre PIS/COFINS", () => {
  it("cascata = icmsRate × (PIS + COFINS)", () => {
    const r = calculateUtilityTax(input({ uf: "RO", icmsRate: 0.25 }));
    const expectedCascade = 0.25 * (r.pisAmount + r.cofinsAmount);
    expect(Math.abs(r.cascade.amount - expectedCascade)).toBeLessThan(0.01);
  });
});

describe("calculateUtilityTax — regime reforma_2026", () => {
  it("cbsAmount + ibsAmount > 0 no regime 2026", () => {
    const r = calculateUtilityTax(input({ regime: "reforma_2026", icmsRate: 0.25 }));
    expect(r.cbsAmount).toBeGreaterThan(0);
    expect(r.ibsAmount).toBeGreaterThan(0);
    expect(r.isHybrid).toBe(true);
  });

  it("totalTaxAmount 2026 > totalTaxAmount atual (mesmo valor de entrada)", () => {
    const atual  = calculateUtilityTax(input({ regime: "atual",       icmsRate: 0.25 }));
    const reform = calculateUtilityTax(input({ regime: "reforma_2026", icmsRate: 0.25 }));
    expect(reform.totalTaxAmount).toBeGreaterThan(atual.totalTaxAmount);
  });

  it("CBS = totalValue × 0,9% e IBS = totalValue × 0,1%", () => {
    const r = calculateUtilityTax(input({ totalValue: 200, regime: "reforma_2026", icmsRate: 0.25 }));
    expect(r.cbsAmount).toBeCloseTo(200 * 0.009, 2);
    expect(r.ibsAmount).toBeCloseTo(200 * 0.001, 2);
  });
});
