"use client";

import { useEffect, useMemo, useState } from "react";
import { calculateTaxBreakdown } from "@/lib/tax-engine";
import { detectUF } from "@/services/geolocation";
import type {
  ExternalTaxRates,
  ProductCategory,
  TaxCalculationResult,
  TaxRegime,
} from "@/types/tax";

export interface CalculatorInputState {
  grossPriceRaw: string;
  productCategory: ProductCategory;
  uf: string;
  regime: TaxRegime;
}

const INITIAL_STATE: CalculatorInputState = {
  grossPriceRaw: "",
  productCategory: "geral",
  uf: "",
  regime: "atual",
};

export interface UseTaxCalculatorReturn {
  inputs: CalculatorInputState;
  grossPrice: number | null;
  result: TaxCalculationResult | null;
  isValid: boolean;
  isDetectingLocation: boolean;
  setGrossPriceRaw: (value: string) => void;
  setProductCategory: (value: ProductCategory) => void;
  setUf: (value: string) => void;
  setRegime: (value: TaxRegime) => void;
  setExternalRates: (rates: ExternalTaxRates | undefined) => void;
}

export function useTaxCalculator(): UseTaxCalculatorReturn {
  const [inputs, setInputs] = useState<CalculatorInputState>(INITIAL_STATE);
  const [isDetectingLocation, setIsDetectingLocation] = useState(true);
  const [externalRates, setExternalRates] = useState<
    ExternalTaxRates | undefined
  >(undefined);

  // Auto-deteccao de UF via Geolocation API + Nominatim
  useEffect(() => {
    let cancelled = false;
    setIsDetectingLocation(true);
    detectUF().then((result) => {
      if (cancelled) return;
      setIsDetectingLocation(false);
      if (result) {
        setInputs((prev) => ({ ...prev, uf: result.uf }));
      } else {
        // Fallback: UF vazia, usuario seleciona manualmente
        setInputs((prev) => ({ ...prev, uf: "" }));
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const grossPrice = useMemo<number | null>(() => {
    const normalized = inputs.grossPriceRaw.replace(",", ".");
    const parsed = parseFloat(normalized);
    return isNaN(parsed) || parsed <= 0 ? null : parsed;
  }, [inputs.grossPriceRaw]);

  const result = useMemo<TaxCalculationResult | null>(() => {
    if (grossPrice === null) return null;
    try {
      return calculateTaxBreakdown(
        {
          grossPrice,
          productCategory: inputs.productCategory,
          regime: inputs.regime,
        },
        externalRates
      );
    } catch {
      return null;
    }
  }, [grossPrice, inputs.productCategory, inputs.regime, externalRates]);

  function setGrossPriceRaw(value: string) {
    setInputs((prev) => ({ ...prev, grossPriceRaw: value }));
  }

  function setProductCategory(value: ProductCategory) {
    setInputs((prev) => ({ ...prev, productCategory: value }));
  }

  function setUf(value: string) {
    setInputs((prev) => ({ ...prev, uf: value }));
  }

  function setRegime(value: TaxRegime) {
    setInputs((prev) => ({ ...prev, regime: value }));
  }

  return {
    inputs,
    grossPrice,
    result,
    isValid: grossPrice !== null,
    isDetectingLocation,
    setGrossPriceRaw,
    setProductCategory,
    setUf,
    setRegime,
    setExternalRates,
  };
}
