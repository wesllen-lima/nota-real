"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { TaxCalculationResult, ProductCategory, TaxRegime } from "@/types/tax";
import type { SalaryBreakdown } from "@/types/salary";
import type { UtilityTaxResult, UtilityFormInputs } from "@/types/utility";
import { detectUF } from "@/services/geolocation";
import { calculateSalaryBreakdown } from "@/lib/salary-engine";

const LS_SALARY_KEY  = "nota-real:salary-v1";
const LS_REGIME_KEY  = "nota-real:regime-v1";

export type WorkRegime = "CLT" | "MEI" | "PJ";
export type SectionId  = "dashboard" | "consumo" | "trabalho" | "utilidades";
export type DrawerId   = "consumo" | "trabalho" | "utilidades" | null;

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

interface AppContextValue {
  // Navegacao Hub & Spoke
  openDrawer: DrawerId;
  setOpenDrawer: (d: DrawerId) => void;

  activeSection: SectionId;
  setActiveSection: (s: SectionId) => void;

  // Regime de trabalho capturado no onboarding
  workRegime: WorkRegime | null;
  setWorkRegime: (r: WorkRegime) => void;

  // Resultados calculados
  taxResult: TaxCalculationResult | null;
  salaryResult: SalaryBreakdown | null;
  utilityResult: UtilityTaxResult | null;
  setTaxResult: (r: TaxCalculationResult | null) => void;
  setSalaryResult: (r: SalaryBreakdown | null) => void;
  setUtilityResult: (r: UtilityTaxResult | null) => void;

  /** Impostos reais lidos de NF-e/NFC-e via XML ou QR scrape */
  nfeTaxAmount: number | null;
  setNfeTaxAmount: (v: number | null) => void;

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
  const [openDrawer, setOpenDrawer] = useState<DrawerId>(null);
  const [workRegime, setWorkRegimeState] = useState<WorkRegime | null>(null);

  const [taxResult, setTaxResult]       = useState<TaxCalculationResult | null>(null);
  const [salaryResult, setSalaryResult] = useState<SalaryBreakdown | null>(null);
  const [utilityResult, setUtilityResult] = useState<UtilityTaxResult | null>(null);
  const [nfeTaxAmount, setNfeTaxAmount] = useState<number | null>(null);

  const [consumoInputs, setConsumoInputs] = useState<CalculatorInputState>(INITIAL_CONSUMO_INPUTS);
  const [nfeRawInput, setNfeRawInput]     = useState("");
  const [rawSalary, setRawSalary]         = useState("");
  const [utilityInputs, setUtilityInputs] = useState<UtilityFormInputs>(INITIAL_UTILITY_INPUTS);

  useEffect(() => {
    const storedRegime = localStorage.getItem(LS_REGIME_KEY) as WorkRegime | null;
    if (storedRegime && ["CLT", "MEI", "PJ"].includes(storedRegime)) {
      setWorkRegimeState(storedRegime);
    }

    const stored = localStorage.getItem(LS_SALARY_KEY);
    if (!stored) return;
    const n = parseFloat(stored);
    if (n > 0) {
      try {
        setSalaryResult(calculateSalaryBreakdown(n));
        setRawSalary(
          n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        );
      } catch {
        localStorage.removeItem(LS_SALARY_KEY);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!rawSalary) return;
    const clean = rawSalary.replace(/R\$\s?/g, "").replace(/\./g, "").replace(",", ".");
    const n = parseFloat(clean);
    if (n > 0) localStorage.setItem(LS_SALARY_KEY, n.toString());
  }, [rawSalary]);

  function setWorkRegime(r: WorkRegime) {
    setWorkRegimeState(r);
    localStorage.setItem(LS_REGIME_KEY, r);
  }

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
    return () => { cancelled = true; };
  }, []);

  const hasAnyResult = salaryResult !== null || taxResult !== null || utilityResult !== null || nfeTaxAmount !== null;

  const totalTaxImpact = useMemo(() => {
    let total = 0;
    if (taxResult)     total += taxResult.totalTaxAmount;
    if (salaryResult)  total += salaryResult.totalTaxBurden;
    if (utilityResult) total += utilityResult.totalTaxAmount;
    if (nfeTaxAmount)  total += nfeTaxAmount;
    return total;
  }, [taxResult, salaryResult, utilityResult, nfeTaxAmount]);

  const laborWorkHours = useMemo(() => {
    if (!salaryResult || salaryResult.grossSalary <= 0) return null;
    const hourlyRate = salaryResult.grossSalary / 176;
    return totalTaxImpact / hourlyRate;
  }, [salaryResult, totalTaxImpact]);

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
        workRegime,
        setWorkRegime,
        taxResult,
        salaryResult,
        utilityResult,
        setTaxResult,
        setSalaryResult,
        setUtilityResult,
        nfeTaxAmount,
        setNfeTaxAmount,
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
