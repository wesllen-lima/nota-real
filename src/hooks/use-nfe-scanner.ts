"use client";

import { useState, useCallback } from "react";
import { validateChave, getUFFromChave } from "@/services/nfe";
import { calculateTaxBreakdown } from "@/lib/tax-engine";
import type { NFeChaveParsed } from "@/types/nfe";
import type { ProductCategory, TaxCalculationResult } from "@/types/tax";

export interface SimulatedItem {
  nItem: number;
  xProd: string;
  category: ProductCategory;
  grossPrice: number;
  taxResult: TaxCalculationResult;
}

export type ScannerStatus = "idle" | "valid" | "invalid";

export interface NfeScannerState {
  rawInput: string;
  status: ScannerStatus;
  errorMessage: string | null;
  parsedKey: NFeChaveParsed | null;
  uf: string | null;
  items: SimulatedItem[];
}

const MOCK_TEMPLATES: Array<{
  xProd: string;
  category: ProductCategory;
  base: number;
}> = [
  { xProd: "Arroz Tipo 1 5kg", category: "alimentacao", base: 24.9 },
  { xProd: "Leite Integral 1L", category: "alimentacao", base: 5.8 },
  { xProd: "Detergente Liquido 500ml", category: "geral", base: 4.5 },
  { xProd: "Agua Mineral 1,5L", category: "alimentacao", base: 3.2 },
  { xProd: "Papel Higienico 4un", category: "geral", base: 9.9 },
  { xProd: "Sabao em Po 1kg", category: "geral", base: 18.5 },
  { xProd: "Oleo de Soja 900ml", category: "alimentacao", base: 8.9 },
  { xProd: "Feijao Carioca 1kg", category: "alimentacao", base: 7.8 },
];

// Deterministic simulation — itens derivados da estrutura da chave
function generateSimulatedItems(key: string): SimulatedItem[] {
  const sum = key.split("").reduce((s, c) => s + parseInt(c, 10), 0);
  const seed = sum % MOCK_TEMPLATES.length;
  // Fator de variacao de preco entre 0% e 4.5% baseado na chave
  const factor = 1 + (seed / 200);

  const indices = [
    seed,
    (seed + 2) % MOCK_TEMPLATES.length,
    (seed + 4) % MOCK_TEMPLATES.length,
    (seed + 6) % MOCK_TEMPLATES.length,
  ];

  return indices.map((templateIdx, i) => {
    const t = MOCK_TEMPLATES[templateIdx];
    const grossPrice = Math.round(t.base * factor * 100) / 100;
    const taxResult = calculateTaxBreakdown({
      grossPrice,
      productCategory: t.category,
      regime: "reforma_2026",
    });
    return {
      nItem: i + 1,
      xProd: t.xProd,
      category: t.category,
      grossPrice,
      taxResult,
    };
  });
}

export function useNfeScanner() {
  const [state, setState] = useState<NfeScannerState>({
    rawInput: "",
    status: "idle",
    errorMessage: null,
    parsedKey: null,
    uf: null,
    items: [],
  });

  const handleInput = useCallback((raw: string) => {
    // Strip tudo que nao for digito e limita em 44
    const digits = raw.replace(/\D/g, "").slice(0, 44);

    if (digits.length < 44) {
      setState({
        rawInput: digits,
        status: "idle",
        errorMessage: null,
        parsedKey: null,
        uf: null,
        items: [],
      });
      return;
    }

    const result = validateChave(digits);
    if (!result.valid) {
      setState({
        rawInput: digits,
        status: "invalid",
        errorMessage: result.error.message,
        parsedKey: null,
        uf: null,
        items: [],
      });
      return;
    }

    const uf = getUFFromChave(result.parsed);
    const items = generateSimulatedItems(digits);

    setState({
      rawInput: digits,
      status: "valid",
      errorMessage: null,
      parsedKey: result.parsed,
      uf,
      items,
    });
  }, []);

  const totalTaxAmount = state.items.reduce(
    (s, item) => s + item.taxResult.totalTaxAmount,
    0
  );
  const totalGrossPrice = state.items.reduce(
    (s, item) => s + item.grossPrice,
    0
  );
  const totalNetPrice = state.items.reduce(
    (s, item) => s + item.taxResult.netPrice,
    0
  );

  return {
    state,
    handleInput,
    totalTaxAmount,
    totalGrossPrice,
    totalNetPrice,
  };
}
