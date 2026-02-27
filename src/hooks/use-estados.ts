"use client";

import { useEffect, useState } from "react";
import { fetchEstados } from "@/services/ibge";
import type { Estado } from "@/types/ibge";

export interface UseEstadosReturn {
  estados: Estado[];
  isLoading: boolean;
  error: string | null;
}

export function useEstados(): UseEstadosReturn {
  const [estados, setEstados] = useState<Estado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetchEstados()
      .then((data) => {
        if (!cancelled) {
          setEstados(data);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erro ao carregar estados");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { estados, isLoading, error };
}
