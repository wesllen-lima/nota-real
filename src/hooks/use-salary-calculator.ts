"use client";

import { useMemo } from "react";
import { calculateSalaryBreakdown } from "@/lib/salary-engine";
import { useAppContext } from "@/context/impact-context";
import type { SalaryBreakdown } from "@/types/salary";

export function useSalaryCalculator() {
  const { rawSalary, setRawSalary } = useAppContext();

  const grossSalary = useMemo<number | null>(() => {
    // Aceita tanto "3500" quanto "3.500,00" quanto "3500.50"
    const normalized = rawSalary.replace(/\./g, "").replace(",", ".");
    const parsed = parseFloat(normalized);
    return isNaN(parsed) || parsed <= 0 ? null : parsed;
  }, [rawSalary]);

  const result = useMemo<SalaryBreakdown | null>(() => {
    if (grossSalary === null) return null;
    try {
      return calculateSalaryBreakdown(grossSalary);
    } catch {
      return null;
    }
  }, [grossSalary]);

  return {
    rawSalary,
    setRawSalary,
    grossSalary,
    result,
    isValid: grossSalary !== null,
  };
}
