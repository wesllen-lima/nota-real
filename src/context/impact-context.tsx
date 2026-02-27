"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { TaxCalculationResult } from "@/types/tax";
import type { SalaryBreakdown } from "@/types/salary";
import type { UtilityTaxResult } from "@/types/utility";

export type SectionId = "dashboard" | "consumo" | "trabalho" | "utilidades";

interface AppContextValue {
  activeSection: SectionId;
  setActiveSection: (s: SectionId) => void;
  taxResult: TaxCalculationResult | null;
  salaryResult: SalaryBreakdown | null;
  utilityResult: UtilityTaxResult | null;
  setTaxResult: (r: TaxCalculationResult | null) => void;
  setSalaryResult: (r: SalaryBreakdown | null) => void;
  setUtilityResult: (r: UtilityTaxResult | null) => void;
  hasAnyResult: boolean;
  totalTaxImpact: number;
  laborWorkHours: number | null;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppContextProvider({ children }: { children: React.ReactNode }) {
  const [activeSection, setActiveSection] = useState<SectionId>("consumo");
  const [taxResult, setTaxResult] = useState<TaxCalculationResult | null>(null);
  const [salaryResult, setSalaryResult] = useState<SalaryBreakdown | null>(null);
  const [utilityResult, setUtilityResult] = useState<UtilityTaxResult | null>(null);

  const hasAnyResult = taxResult !== null || salaryResult !== null || utilityResult !== null;

  const totalTaxImpact = useMemo(() => {
    let total = 0;
    if (taxResult) total += taxResult.totalTaxAmount;
    if (salaryResult) total += salaryResult.totalTaxBurden;
    if (utilityResult) total += utilityResult.totalTaxAmount;
    return total;
  }, [taxResult, salaryResult, utilityResult]);

  const laborWorkHours = useMemo(() => {
    if (!salaryResult || salaryResult.grossSalary <= 0) return null;
    const hourlyRate = salaryResult.grossSalary / 176;
    return totalTaxImpact / hourlyRate;
  }, [salaryResult, totalTaxImpact]);

  return (
    <AppContext.Provider
      value={{
        activeSection,
        setActiveSection,
        taxResult,
        salaryResult,
        utilityResult,
        setTaxResult,
        setSalaryResult,
        setUtilityResult,
        hasAnyResult,
        totalTaxImpact,
        laborWorkHours,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used inside AppContextProvider");
  return ctx;
}
