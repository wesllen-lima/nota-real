"use client";

import { useCallback, useState } from "react";
import { calculateUtilityTax, getDefaultRegionalAverage } from "@/lib/utility-engine";
import { UtilityInputSchema } from "@/types/utility";
import type { UtilityInput, UtilityTaxResult } from "@/types/utility";
import { toast } from "@/hooks/use-toast";

// NCM por tipo de utilidade (para consulta IBPT)
const NCM_ENERGIA = "27160000"; // Energia eletrica
const NCM_AGUA    = "22011000"; // Agua natural/tratada

interface State {
  result: UtilityTaxResult | null;
  error: string | null;
  isCalculating: boolean;
}

async function fetchIcmsFromIbpt(ncm: string, uf: string): Promise<number | undefined> {
  try {
    const params = new URLSearchParams({ ...(uf ? { uf } : {}) });
    const res = await fetch(`/api/ibpt/ncm/${ncm}?${params.toString()}`, {
      signal: AbortSignal.timeout(5_000),
    });
    if (!res.ok) return undefined;
    const data = await res.json() as { estadual?: number; source?: string };
    if (data.source === "ibpt_live" && typeof data.estadual === "number") {
      return data.estadual; // ja em decimal (0..1)
    }
    return undefined;
  } catch {
    return undefined;
  }
}

export function useUtilityCalculator() {
  const [state, setState] = useState<State>({
    result: null,
    error: null,
    isCalculating: false,
  });

  const calculate = useCallback(async (raw: Partial<UtilityInput>) => {
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

    // Busca ICMS em tempo real via IBPT — fallback automatico se offline
    const ncm = parsed.data.type === "energia" ? NCM_ENERGIA : NCM_AGUA;
    const uf  = parsed.data.uf ?? "";
    const icmsRate = await fetchIcmsFromIbpt(ncm, uf);
    if (icmsRate === undefined) {
      toast("IBPT offline — usando ICMS medio nacional como fallback");
    }

    try {
      const result = calculateUtilityTax({ ...parsed.data, icmsRate });
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
