"use client";

import { useMemo, useState } from "react";
import { calculateTaxBreakdown } from "@/lib/tax-engine";
import { useAppContext, type CalculatorInputState } from "@/context/impact-context";
import type { ExternalTaxRates, ProductCategory, TaxCalculationResult, TaxRegime } from "@/types/tax";

export type { CalculatorInputState };

export interface UseTaxCalculatorReturn {
  inputs: CalculatorInputState;
  grossPrice: number | null;
  result: TaxCalculationResult | null;
  resultAtual: TaxCalculationResult | null;
  result2026: TaxCalculationResult | null;
  isValid: boolean;
  isDetectingLocation: boolean;
  setGrossPriceRaw: (value: string) => void;
  setProductCategory: (value: ProductCategory) => void;
  setUf: (value: string) => void;
  setRegime: (value: TaxRegime) => void;
  setExternalRates: (rates: ExternalTaxRates | undefined) => void;
}

export function useTaxCalculator(): UseTaxCalculatorReturn {
  const { consumoInputs, setConsumoInputs, isDetectingLocation } = useAppContext();
  const [externalRates, setExternalRates] = useState<ExternalTaxRates | undefined>(undefined);

  const grossPrice = useMemo<number | null>(() => {
    const normalized = consumoInputs.grossPriceRaw.replace(",", ".");
    const parsed = parseFloat(normalized);
    return isNaN(parsed) || parsed <= 0 ? null : parsed;
  }, [consumoInputs.grossPriceRaw]);

  const resultAtual = useMemo<TaxCalculationResult | null>(() => {
    if (grossPrice === null) return null;
    try {
      return calculateTaxBreakdown(
        { grossPrice, productCategory: consumoInputs.productCategory, regime: "atual" },
        externalRates
      );
    } catch {
      return null;
    }
  }, [grossPrice, consumoInputs.productCategory, externalRates]);

  const result2026 = useMemo<TaxCalculationResult | null>(() => {
    if (grossPrice === null) return null;
    try {
      return calculateTaxBreakdown(
        { grossPrice, productCategory: consumoInputs.productCategory, regime: "reforma_2026" },
        externalRates
      );
    } catch {
      return null;
    }
  }, [grossPrice, consumoInputs.productCategory, externalRates]);

  const result = consumoInputs.regime === "reforma_2026" ? result2026 : resultAtual;

  function setGrossPriceRaw(value: string) {
    setConsumoInputs({ ...consumoInputs, grossPriceRaw: value });
  }

  function setProductCategory(value: ProductCategory) {
    setConsumoInputs({ ...consumoInputs, productCategory: value });
  }

  function setUf(value: string) {
    setConsumoInputs({ ...consumoInputs, uf: value });
  }

  function setRegime(value: TaxRegime) {
    setConsumoInputs({ ...consumoInputs, regime: value });
  }

  return {
    inputs: consumoInputs,
    grossPrice,
    result,
    resultAtual,
    result2026,
    isValid: grossPrice !== null,
    isDetectingLocation,
    setGrossPriceRaw,
    setProductCategory,
    setUf,
    setRegime,
    setExternalRates,
  };
}
