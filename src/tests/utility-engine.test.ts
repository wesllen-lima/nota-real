import { describe, it, expect } from "vitest";
import { calculateUtilityTax } from "@/lib/utility-engine";
import type { UtilityInput } from "@/types/utility";

function input(overrides: Partial<UtilityInput>): UtilityInput {
  return {
    type: "energia",
    totalValue: 100,
    inputMode: "fatura",
    regime: "atual",
    uf: "RO",
    ...overrides,
  };
}

describe("calculateUtilityTax — ICMS por UF", () => {
  it("energia SP — icmsRate = 0,12", () => {
    const r = calculateUtilityTax(input({ uf: "SP" }));
    expect(r.icmsRate).toBe(0.12);
    expect(r.icmsAmount).toBeCloseTo(12, 1);
  });

  it("energia RO — icmsRate = 0,25", () => {
    const r = calculateUtilityTax(input({ uf: "RO" }));
    expect(r.icmsRate).toBe(0.25);
    expect(r.icmsAmount).toBeCloseTo(25, 1);
  });

  it("agua RO — icmsRate = 0 (isencao Decreto 12.051/2006)", () => {
    const r = calculateUtilityTax(input({ type: "agua", uf: "RO" }));
    expect(r.icmsRate).toBe(0);
    expect(r.icmsAmount).toBe(0);
  });
});

describe("calculateUtilityTax — cascata ICMS sobre PIS/COFINS", () => {
  it("cascata = icmsRate × (PIS + COFINS)", () => {
    const r = calculateUtilityTax(input({ uf: "RO" }));
    const expectedCascade = 0.25 * (r.pisAmount + r.cofinsAmount);
    expect(Math.abs(r.cascade.amount - expectedCascade)).toBeLessThan(0.01);
  });
});

describe("calculateUtilityTax — regime reforma_2026", () => {
  it("cbsAmount + ibsAmount > 0 no regime 2026", () => {
    const r = calculateUtilityTax(input({ regime: "reforma_2026" }));
    expect(r.cbsAmount).toBeGreaterThan(0);
    expect(r.ibsAmount).toBeGreaterThan(0);
    expect(r.isHybrid).toBe(true);
  });

  it("totalTaxAmount 2026 > totalTaxAmount atual (mesmo valor de entrada)", () => {
    const atual  = calculateUtilityTax(input({ regime: "atual" }));
    const reform = calculateUtilityTax(input({ regime: "reforma_2026" }));
    expect(reform.totalTaxAmount).toBeGreaterThan(atual.totalTaxAmount);
  });

  it("CBS = totalValue × 0,9% e IBS = totalValue × 0,1%", () => {
    const r = calculateUtilityTax(input({ totalValue: 200, regime: "reforma_2026" }));
    expect(r.cbsAmount).toBeCloseTo(200 * 0.009, 2);
    expect(r.ibsAmount).toBeCloseTo(200 * 0.001, 2);
  });
});
