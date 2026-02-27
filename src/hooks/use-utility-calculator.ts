"use client";

import { useCallback, useState } from "react";
import { calculateUtilityTax, getDefaultRegionalAverage } from "@/lib/utility-engine";
import { UtilityInputSchema } from "@/types/utility";
import type { UtilityInput, UtilityTaxResult } from "@/types/utility";

interface State {
  result: UtilityTaxResult | null;
  error: string | null;
  isCalculating: boolean;
}

export function useUtilityCalculator() {
  const [state, setState] = useState<State>({
    result: null,
    error: null,
    isCalculating: false,
  });

  const calculate = useCallback((raw: Partial<UtilityInput>) => {
    setState((s) => ({ ...s, isCalculating: true, error: null }));

    const parsed = UtilityInputSchema.safeParse(raw);
    if (!parsed.success) {
      setState({
        result: null,
        isCalculating: false,
        error: parsed.error.issues[0]?.message ?? "Dados invalidos",
      });
      return;
    }

    try {
      const result = calculateUtilityTax(parsed.data);
      setState({ result, isCalculating: false, error: null });
    } catch (err) {
      setState({
        result: null,
        isCalculating: false,
        error: err instanceof Error ? err.message : "Erro inesperado",
      });
    }
  }, []);

  const simulateRegional = useCallback(
    (type: UtilityInput["type"], uf = "RO", regime: UtilityInput["regime"] = "atual") => {
      const avg = getDefaultRegionalAverage();
      const totalValue = type === "energia" ? avg.avgEnergia : avg.avgAgua;
      calculate({ type, totalValue, inputMode: "simulado", uf, regime });
    },
    [calculate]
  );

  const reset = useCallback(() => {
    setState({ result: null, error: null, isCalculating: false });
  }, []);

  return { ...state, calculate, simulateRegional, reset };
}
