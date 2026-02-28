import { describe, it, expect } from "vitest";
import { calculateTaxBreakdown } from "@/lib/tax-engine";

describe("calculateTaxBreakdown — regime atual", () => {
  it("grossPrice <= 0 lanca RangeError", () => {
    expect(() =>
      calculateTaxBreakdown({ grossPrice: 0, productCategory: "geral", regime: "atual" })
    ).toThrow(RangeError);
    expect(() =>
      calculateTaxBreakdown({ grossPrice: -1, productCategory: "geral", regime: "atual" })
    ).toThrow(RangeError);
  });

  it("alimentacao R$ 100 — ICMS 12% + PIS 0,65% + COFINS 3% + IPI 0%", () => {
    const r = calculateTaxBreakdown({ grossPrice: 100, productCategory: "alimentacao", regime: "atual" });
    const icms = r.breakdown.find((b) => b.code === "ICMS");
    const pis  = r.breakdown.find((b) => b.code === "PIS");
    const cofins = r.breakdown.find((b) => b.code === "COFINS");
    const ipi = r.breakdown.find((b) => b.code === "IPI");

    expect(icms?.rate).toBe(0.12);
    expect(pis?.rate).toBe(0.0065);
    expect(cofins?.rate).toBe(0.03);
    expect(ipi).toBeUndefined(); // filtrado porque rate = 0
  });

  it("eletronicos R$ 1.000 — IPI 15% presente", () => {
    const r = calculateTaxBreakdown({ grossPrice: 1000, productCategory: "eletronicos", regime: "atual" });
    const ipi = r.breakdown.find((b) => b.code === "IPI");
    expect(ipi?.rate).toBe(0.15);
    expect(ipi?.amountPaid).toBe(150);
  });

  it("totalTaxAmount = grossPrice - netPrice", () => {
    const r = calculateTaxBreakdown({ grossPrice: 200, productCategory: "geral", regime: "atual" });
    expect(Math.abs(r.totalTaxAmount - (r.grossPrice - r.netPrice))).toBeLessThan(0.01);
  });

  it("effectiveTaxRate = totalTaxAmount / grossPrice", () => {
    const r = calculateTaxBreakdown({ grossPrice: 500, productCategory: "combustivel", regime: "atual" });
    const computed = r.totalTaxAmount / r.grossPrice;
    expect(Math.abs(r.effectiveTaxRate - computed)).toBeLessThan(0.0001);
  });

  it("isHybrid = false no regime atual", () => {
    const r = calculateTaxBreakdown({ grossPrice: 100, productCategory: "geral", regime: "atual" });
    expect(r.isHybrid).toBe(false);
    expect(r.hybridSummary).toBeUndefined();
  });
});

describe("calculateTaxBreakdown — regime reforma_2026", () => {
  it("isHybrid = true", () => {
    const r = calculateTaxBreakdown({ grossPrice: 100, productCategory: "geral", regime: "reforma_2026" });
    expect(r.isHybrid).toBe(true);
  });

  it("breakdown contem items legado E iva_teste", () => {
    const r = calculateTaxBreakdown({ grossPrice: 100, productCategory: "geral", regime: "reforma_2026" });
    const legado  = r.breakdown.filter((b) => b.layer === "legado");
    const ivaTeste = r.breakdown.filter((b) => b.layer === "iva_teste");
    expect(legado.length).toBeGreaterThan(0);
    expect(ivaTeste.length).toBeGreaterThan(0);
  });

  it("IVA contem CBS (0,9%) e IBS (0,1%)", () => {
    const r = calculateTaxBreakdown({ grossPrice: 100, productCategory: "geral", regime: "reforma_2026" });
    const cbs = r.breakdown.find((b) => b.code === "CBS");
    const ibs = r.breakdown.find((b) => b.code === "IBS");
    expect(cbs?.rate).toBe(0.009);
    expect(ibs?.rate).toBe(0.001);
  });

  it("hybridSummary.ivaRate = 0.01 (CBS 0,9% + IBS 0,1%)", () => {
    const r = calculateTaxBreakdown({ grossPrice: 100, productCategory: "alimentacao", regime: "reforma_2026" });
    expect(r.hybridSummary?.ivaRate).toBeCloseTo(0.01, 4);
  });

  it("totalTaxAmount 2026 SEMPRE maior que regime atual (mesma categoria)", () => {
    const cats = ["geral", "alimentacao", "eletronicos", "combustivel"] as const;
    for (const cat of cats) {
      const atual   = calculateTaxBreakdown({ grossPrice: 100, productCategory: cat, regime: "atual" });
      const reform  = calculateTaxBreakdown({ grossPrice: 100, productCategory: cat, regime: "reforma_2026" });
      expect(reform.totalTaxAmount).toBeGreaterThan(atual.totalTaxAmount);
    }
  });

  it("hybridSummary.legacyRate = effectiveTaxRate do regime atual", () => {
    const cat = "geral";
    const atual  = calculateTaxBreakdown({ grossPrice: 100, productCategory: cat, regime: "atual" });
    const reform = calculateTaxBreakdown({ grossPrice: 100, productCategory: cat, regime: "reforma_2026" });
    expect(Math.abs((reform.hybridSummary?.legacyRate ?? 0) - atual.effectiveTaxRate)).toBeLessThan(0.0001);
  });
});
