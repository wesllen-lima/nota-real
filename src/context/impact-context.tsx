"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { TaxCalculationResult, ProductCategory, TaxRegime } from "@/types/tax";
import type { SalaryBreakdown } from "@/types/salary";
import type { UtilityTaxResult, UtilityFormInputs } from "@/types/utility";
import { detectUF } from "@/services/geolocation";

export type SectionId = "dashboard" | "consumo" | "trabalho" | "utilidades";
export type DrawerId = "consumo" | "trabalho" | "utilidades" | null;

// ============================================================
// Estado de formulario da secao Consumo (persistido no context)
// ============================================================
export interface CalculatorInputState {
  grossPriceRaw: string;
  productCategory: ProductCategory;
  uf: string;
  regime: TaxRegime;
}

const INITIAL_CONSUMO_INPUTS: CalculatorInputState = {
  grossPriceRaw: "",
  productCategory: "geral",
  uf: "",
  regime: "atual",
};

const INITIAL_UTILITY_INPUTS: UtilityFormInputs = {
  activeTab: "energia",
  inputMode: "simulado",
  valueStr: "",
  regime: "atual",
};

// ============================================================
// Interface do context
// ============================================================
interface AppContextValue {
  // Navegacao Hub & Spoke
  openDrawer: DrawerId;
  setOpenDrawer: (d: DrawerId) => void;

  // Compatibilidade retroativa — derivado de openDrawer
  activeSection: SectionId;
  setActiveSection: (s: SectionId) => void;

  // Resultados calculados
  taxResult: TaxCalculationResult | null;
  salaryResult: SalaryBreakdown | null;
  utilityResult: UtilityTaxResult | null;
  setTaxResult: (r: TaxCalculationResult | null) => void;
  setSalaryResult: (r: SalaryBreakdown | null) => void;
  setUtilityResult: (r: UtilityTaxResult | null) => void;

  // Derivados
  hasAnyResult: boolean;
  totalTaxImpact: number;
  laborWorkHours: number | null;

  // Estado de formulario persistido
  consumoInputs: CalculatorInputState;
  setConsumoInputs: (s: CalculatorInputState) => void;
  isDetectingLocation: boolean;

  nfeRawInput: string;
  setNfeRawInput: (s: string) => void;

  rawSalary: string;
  setRawSalary: (s: string) => void;

  utilityInputs: UtilityFormInputs;
  setUtilityInputs: (s: UtilityFormInputs) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppContextProvider({ children }: { children: React.ReactNode }) {
  // Navegacao
  const [openDrawer, setOpenDrawer] = useState<DrawerId>(null);

  // Resultados
  const [taxResult, setTaxResult] = useState<TaxCalculationResult | null>(null);
  const [salaryResult, setSalaryResult] = useState<SalaryBreakdown | null>(null);
  const [utilityResult, setUtilityResult] = useState<UtilityTaxResult | null>(null);

  // Inputs persistidos
  const [consumoInputs, setConsumoInputs] = useState<CalculatorInputState>(INITIAL_CONSUMO_INPUTS);
  const [nfeRawInput, setNfeRawInput] = useState("");
  const [rawSalary, setRawSalary] = useState("");
  const [utilityInputs, setUtilityInputs] = useState<UtilityFormInputs>(INITIAL_UTILITY_INPUTS);

  // Geolocation — detecta UF uma unica vez no mount
  const [isDetectingLocation, setIsDetectingLocation] = useState(true);
  useEffect(() => {
    let cancelled = false;
    setIsDetectingLocation(true);
    detectUF().then((result) => {
      if (cancelled) return;
      setIsDetectingLocation(false);
      if (result) {
        setConsumoInputs((prev) => ({ ...prev, uf: result.uf }));
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Derivados
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

  // Compatibilidade retroativa
  const activeSection: SectionId = openDrawer ?? "dashboard";
  function setActiveSection(s: SectionId) {
    setOpenDrawer(s === "dashboard" ? null : (s as DrawerId));
  }

  return (
    <AppContext.Provider
      value={{
        openDrawer,
        setOpenDrawer,
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
        consumoInputs,
        setConsumoInputs,
        isDetectingLocation,
        nfeRawInput,
        setNfeRawInput,
        rawSalary,
        setRawSalary,
        utilityInputs,
        setUtilityInputs,
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
