import { describe, it, expect } from "vitest";
import { calculateSalaryBreakdown } from "@/lib/salary-engine";
import { INSS_TETO_2026 } from "@/config/salary-tables-2026";

// Precisao: valores em R$ com tolerancia de ±R$ 0,02 (arredondamento progressivo)
const R = (v: number) => Math.round(v * 100) / 100;

describe("calculateSalaryBreakdown — INSS 2026 (Portaria MPS/MF n.13)", () => {
  it("R$ 1.621 — salario minimo: tudo na faixa 7,5%", () => {
    const r = calculateSalaryBreakdown(1621);
    expect(r.inssEmployee).toBeCloseTo(121.58, 1);
    expect(r.irpfAmount).toBe(0);
    expect(r.netSalary).toBeCloseTo(1621 - 121.58, 1);
  });

  it("R$ 1.800 — span faixas 7,5% + 9%", () => {
    // INSS = 1621×7,5% + 179×9% = 121,575 + 16,11 = 137,685
    const r = calculateSalaryBreakdown(1800);
    expect(r.inssEmployee).toBeCloseTo(137.69, 1);
    expect(r.irpfAmount).toBe(0); // bruto ≤ 5000 → redutor zera
  });

  it("R$ 3.000 — faixas 7,5% + 9% + 12% (teto faixa 2 = 2.902,84)", () => {
    // INSS = 1621×7,5% + 1281,84×9% + 97,16×12% = 121,575 + 115,3656 + 11,6592 = 248,60
    const r = calculateSalaryBreakdown(3000);
    expect(r.inssEmployee).toBeCloseTo(248.60, 1);
    expect(r.irpfAmount).toBe(0); // bruto ≤ 5000 → redutor zera
  });

  it("R$ 5.000 — bruto no threshold exato: IRPF deve ser zero", () => {
    // INSS = 5000×14% - 198,49 = 501,51
    const r = calculateSalaryBreakdown(5000);
    expect(r.inssEmployee).toBeCloseTo(501.51, 1);
    expect(r.irpfAmount).toBe(0);
  });

  it("R$ 6.000 — redutor parcial", () => {
    // INSS = 6000×14% - 198,49 = 641,51
    // irpfBase = 6000 - 641,51 = 5358,49
    // irpfBruto = 5358,49×27,5% - 908,73 = 564,85
    // reducao = 978,62 - 0,133145×6000 = 179,75
    // IRPF = 564,85 - 179,75 = 385,10
    const r = calculateSalaryBreakdown(6000);
    expect(r.inssEmployee).toBeCloseTo(641.51, 1);
    expect(r.irpfAmount).toBeCloseTo(385.10, 0);
  });

  it("R$ 8.000 — bruto acima de 7.350: sem redutor", () => {
    // INSS = 8000×14% - 198,49 = 921,51
    // irpfBase = 8000 - 921,51 = 7078,49
    // irpfBruto = 7078,49×27,5% - 908,73 = 1037,85
    const r = calculateSalaryBreakdown(8000);
    expect(r.inssEmployee).toBeCloseTo(921.51, 1);
    expect(r.irpfAmount).toBeCloseTo(1037.85, 0);
  });

  it("R$ 10.000 — acima do teto INSS: desconto maximo R$ 988,09", () => {
    // INSS = 8475,55×14% - 198,49 = 988,09 (maximo)
    const r = calculateSalaryBreakdown(10000);
    expect(r.inssEmployee).toBeCloseTo(988.09, 1);
  });

  it("INSS nunca ultrapassa R$ 988,09 independente do salario", () => {
    const salarios = [8500, 10000, 15000, 30000, 100000];
    for (const s of salarios) {
      const r = calculateSalaryBreakdown(s);
      expect(r.inssEmployee).toBeLessThanOrEqual(R(INSS_TETO_2026 * 0.14) + 1);
      // desconto maximo teorico: 8475,55×14% - 198,49 = 988,09
      expect(r.inssEmployee).toBeCloseTo(988.09, 0);
    }
  });
});

describe("calculateSalaryBreakdown — invariantes", () => {
  const salarios = [1621, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 10000, 15000];

  it("inssEmployee + irpfAmount + netSalary == grossSalary (±R$ 0,01)", () => {
    for (const s of salarios) {
      const r = calculateSalaryBreakdown(s);
      const sum = R(r.inssEmployee + r.irpfAmount + r.netSalary);
      expect(Math.abs(sum - r.grossSalary)).toBeLessThanOrEqual(0.01);
    }
  });

  it("totalTaxBurden = inssEmployee + irpfAmount + totalEmployerCost", () => {
    for (const s of salarios) {
      const r = calculateSalaryBreakdown(s);
      const expected = R(r.inssEmployee + r.irpfAmount + r.totalEmployerCost);
      expect(Math.abs(r.totalTaxBurden - expected)).toBeLessThanOrEqual(0.01);
    }
  });

  it("effectiveTotalRate = totalTaxBurden / realLaborCost", () => {
    for (const s of salarios) {
      const r = calculateSalaryBreakdown(s);
      const computed = r.totalTaxBurden / r.realLaborCost;
      expect(Math.abs(r.effectiveTotalRate - computed)).toBeLessThan(0.0005);
    }
  });

  it("netSalary sempre positivo", () => {
    for (const s of salarios) {
      const r = calculateSalaryBreakdown(s);
      expect(r.netSalary).toBeGreaterThan(0);
    }
  });

  it("grossSalary <= 0 lanca RangeError", () => {
    expect(() => calculateSalaryBreakdown(0)).toThrow(RangeError);
    expect(() => calculateSalaryBreakdown(-100)).toThrow(RangeError);
  });
});
