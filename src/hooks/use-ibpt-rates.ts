"use client";

import { useEffect, useState } from "react";
import { fetchIbptByNcm, type IbptSource } from "@/services/ibpt";
import type { ExternalTaxRates } from "@/types/tax";

interface UseIbptRatesResult {
  rates: ExternalTaxRates | null;
  source: IbptSource;
  loading: boolean;
}

export function useIbptRates(ncm?: string): UseIbptRatesResult {
  const [rates, setRates] = useState<ExternalTaxRates | null>(null);
  const [source, setSource] = useState<IbptSource>("default_rates");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ncm || !/^\d{8}$/.test(ncm)) {
      setRates(null);
      setSource("default_rates");
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetchIbptByNcm(ncm).then((result) => {
      if (cancelled) return;
      setRates(result.rates);
      setSource(result.source);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [ncm]);

  return { rates, source, loading };
}
